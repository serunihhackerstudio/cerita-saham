"""Timing kata subtitle untuk REKAMAN SATU FILE, memakai Edge TTS sebagai acuan.

  python tts/align_edge.py            (jalankan setelah tts/rekaman_timing.py)

1. Generate ulang Edge TTS per scene (tts/_ref/sN.mp3) + stempel waktu kata (WordBoundary).
2. Potong rekaman (public/audio/voiceover.mp3) per scene memakai batas di public/audio/timing.json.
3. Cocokkan bunyi Edge TTS dengan rekaman (DTW atas spektrum log-mel), lalu pindahkan
   waktu tiap kata dari Edge TTS ke rekaman.
4. Tulis ulang "words" di public/audio/timing.json (batas scene tidak diubah).
Butuh: edge-tts, numpy, ffmpeg di PATH.
"""
import asyncio, json, re, subprocess, sys
from pathlib import Path

import numpy as np
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "tts" / "_ref"
SR, HOP, WIN, NMEL = 16000, 160, 400, 40  # 10 ms hop


def pcm(path, start=None, dur=None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}", "-t", f"{dur:.3f}"]
    cmd += ["-i", str(path), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", "-f", "wav", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    k = raw.find(b"data") + 8  # lewati header WAV
    return np.frombuffer(raw[k : k + (len(raw) - k) // 2 * 2], dtype=np.int16).astype(np.float32) / 32768


def mel_fb():
    hz2mel = lambda h: 2595 * np.log10(1 + h / 700)
    mel2hz = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = mel2hz(np.linspace(hz2mel(60), hz2mel(7600), NMEL + 2))
    bins = np.floor((512 + 1) * pts / SR).astype(int)
    fb = np.zeros((NMEL, 257))
    for i in range(1, NMEL + 1):
        a, b, c = bins[i - 1], bins[i], bins[i + 1]
        fb[i - 1, a:b] = (np.arange(a, b) - a) / max(b - a, 1)
        fb[i - 1, b:c] = (c - np.arange(b, c)) / max(c - b, 1)
    return fb


FB = mel_fb()


def feats(x):
    n = 1 + max(0, (len(x) - WIN) // HOP)
    idx = np.arange(WIN)[None, :] + HOP * np.arange(n)[:, None]
    fr = np.pad(x, (0, WIN))[idx] * np.hanning(WIN)
    spec = np.abs(np.fft.rfft(fr, 512)) ** 2
    m = np.log(spec @ FB.T + 1e-8)
    m = (m - m.mean(0)) / (m.std(0) + 1e-5)
    # tambahkan delta supaya transisi bunyi lebih jelas
    d = np.gradient(m, axis=0)
    f = np.hstack([m, d])
    return f / (np.linalg.norm(f, axis=1, keepdims=True) + 1e-8)


def dtw_map(a, b):
    """Kembalikan array: untuk tiap frame a -> frame b (rata-rata di jalur DTW)."""
    cost = 1 - a @ b.T  # jarak kosinus
    n, m = cost.shape
    D = np.empty((n, m), dtype=np.float64)
    D[0] = np.cumsum(cost[0])
    for i in range(1, n):
        prev = D[i - 1]
        a_j = np.minimum(prev, np.concatenate(([np.inf], prev[:-1])))  # dari atas / diagonal
        S = np.cumsum(cost[i])
        Sm1 = np.concatenate(([0.0], S[:-1]))
        D[i] = S + np.minimum.accumulate(a_j - Sm1)  # termasuk langkah horizontal dalam baris
    i, j, path = n - 1, m - 1, [(n - 1, m - 1)]
    while i > 0 or j > 0:
        if i == 0:
            j -= 1
        elif j == 0:
            i -= 1
        else:
            k = np.argmin([D[i - 1, j - 1], D[i - 1, j], D[i, j - 1]])
            i, j = (i - 1, j - 1) if k == 0 else (i - 1, j) if k == 1 else (i, j - 1)
        path.append((i, j))
    mp = np.zeros(n)
    cnt = np.zeros(n)
    for i, j in path:
        mp[i] += j
        cnt[i] += 1
    return mp / np.maximum(cnt, 1)


async def edge_scene(sc, voice, rate, pitch):
    path = REF / f"{sc['id']}.mp3"
    try:
        comm = edge_tts.Communicate(sc["text"], voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    except TypeError:
        comm = edge_tts.Communicate(sc["text"], voice, rate=rate, pitch=pitch)
    words = []
    with open(path, "wb") as fh:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                fh.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append((ch["text"], s, s + ch["duration"] / 1e7))
    return path, words


async def gen_all(naskah):
    REF.mkdir(exist_ok=True)
    out = []
    for sc in naskah["scenes"]:
        for attempt in range(3):
            try:
                out.append(await edge_scene(sc, naskah["voice"], naskah.get("rate", "+0%"), naskah.get("pitch", "+0Hz")))
                break
            except Exception as e:
                if attempt == 2:
                    raise
                print(f"  {sc['id']}: ulang ({e.__class__.__name__})")
    return out


def main():
    naskah = json.loads((ROOT / "tts" / "naskah.json").read_text(encoding="utf-8"))
    tpath = ROOT / "public" / "audio" / "timing.json"
    timing = json.loads(tpath.read_text(encoding="utf-8"))
    vo = ROOT / "public" / "audio" / timing["voiceover"]
    print("Generate ulang Edge TTS (acuan timing)...")
    refs = asyncio.run(gen_all(naskah))

    log = subprocess.run(["ffmpeg", "-i", str(vo), "-af", "silencedetect=n=-38dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    sil = list(zip(map(float, re.findall(r"silence_start: ([\d.]+)", log)), map(float, re.findall(r"silence_end: ([\d.]+)", log))))

    def snap(t):  # kata yang jatuh di dalam hening -> geser ke saat suara mulai lagi
        for a, b in sil:
            if a < t < b:
                return b
        return t

    start = 0.0
    for sc, scn, (rpath, ewords) in zip(timing["scenes"], naskah["scenes"], refs):
        dur = sc["duration"]
        rec = pcm(vo, start, dur)
        ref = pcm(rpath)
        fa, fb = feats(ref), feats(rec)
        mp = dtw_map(fa, fb)
        to_rec = lambda t: float(np.interp(t * SR / HOP, np.arange(len(mp)), mp)) * HOP / SR

        tokens = scn["text"].split()
        texts = tokens if len(tokens) == len(ewords) else [w for w, _, _ in ewords]
        if len(tokens) != len(ewords):
            print(f"  {sc['id']}: jumlah kata naskah {len(tokens)} != Edge {len(ewords)}, pakai teks Edge")
        ws = []
        for txt, (_, s, e) in zip(texts, ewords):
            rs, re_ = to_rec(s), to_rec(e)
            rs = snap(start + rs) - start
            ws.append({"w": txt, "start": round(rs, 3), "end": round(max(re_, rs + 0.08), 3)})
        for k in range(1, len(ws)):  # jaga urutan naik
            ws[k]["start"] = max(ws[k]["start"], ws[k - 1]["start"] + 0.04)
            ws[k]["end"] = max(ws[k]["end"], ws[k]["start"] + 0.08)
        sc["words"] = ws
        print(f"  {sc['id']}: {len(ws)} kata, {ws[0]['start']:.2f}-{ws[-1]['end']:.2f} dtk dari {dur:.2f}")
        start += dur
    timing["word_timing"] = "edge-tts + DTW"
    tpath.write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding="utf-8")
    print("OK -> public/audio/timing.json")


if __name__ == "__main__":
    main()
