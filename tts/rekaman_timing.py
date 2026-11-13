"""Timing dari REKAMAN SUARA SATU FILE (rekaman sendiri / TTS mana pun).

  python tts/rekaman_timing.py rekaman.wav            # file apa pun yang dibaca ffmpeg
  python tts/rekaman_timing.py rekaman.wav --tail 2.2 # jeda setelah kalimat terakhir (dtk)

Langkah:
1. Ubah rekaman jadi public/audio/voiceover.mp3.
2. Cari jeda panjang (antar-paragraf) -> batas scene. Jumlah scene = jumlah scene di tts/naskah.json,
   jadi bacalah naskah dengan jeda yang jelas lebih panjang di antara scene.
3. Timing tiap kata: kalau faster-whisper terpasang, dipakai stempel waktu kata dari Whisper
   (teksnya tetap dari naskah). Kalau tidak, kata dibagi rata menurut panjang hurufnya di dalam
   potongan suara, dengan batas kalimat ditempelkan ke jeda terdekat (cukup akurat untuk subtitle).
4. Tulis public/audio/timing.json (dipakai otomatis oleh Remotion).
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)])
    return float(r.stdout.strip())


def silences(path, db=-38, minlen=0.25):
    r = run(["ffmpeg", "-i", str(path), "-af", f"silencedetect=n={db}dB:d={minlen}", "-f", "null", "-"])
    s, out = None, []
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", line)
        if m:
            s = float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", line)
        if m and s is not None:
            out.append((s, float(m.group(1))))
            s = None
    return out


def speech_chunks(a, b, sil):
    """Potongan bersuara di dalam [a, b], dipisah oleh jeda."""
    chunks, cur = [], a
    for s, e in sil:
        if e <= a or s >= b:
            continue
        s, e = max(s, a), min(e, b)
        if s > cur + 0.05:
            chunks.append((cur, s))
        cur = max(cur, e)
    if b > cur + 0.05:
        chunks.append((cur, b))
    return chunks


def weight(w):
    return max(1, len(re.sub(r"[^A-Za-z0-9]", "", w))) + 1.5


def align_words(words, chunks):
    """Bagi kata ke potongan suara: batas kalimat/koma ditempel ke jeda (DP monoton)."""
    n, k = len(words), len(chunks)
    if k == 1 or n == 0:
        groups = [list(range(n))]
        chunks = [(chunks[0][0], chunks[-1][1])]
    else:
        cand = [i + 1 for i, w in enumerate(words[:-1]) if re.search(r"[.,!?…:;]$", w)]
        cw = [0.0]
        for w in words:
            cw.append(cw[-1] + weight(w))
        tot_t = sum(e - s for s, e in chunks)
        # pecah potongan menjadi target fraksi
        tfrac, acc = [], 0.0
        for s, e in chunks[:-1]:
            acc += e - s
            tfrac.append(acc / tot_t)
        # pilih untuk tiap jeda: satu kandidat batas (atau tidak ada) -> DP sederhana
        import math
        best = {(-1, 0): (0.0, [])}  # (index jeda terakhir dipakai, posisi kandidat berikut) -> biaya
        states = [(0.0, [], 0)]  # biaya, batas terpilih (per jeda: idx kata atau None), cand ptr
        for j, f in enumerate(tfrac):
            nxt = []
            for cost, picks, p in states:
                nxt.append((cost + 0.35, picks + [None], p))  # jeda ini di tengah kalimat
                for q in range(p, len(cand)):
                    d = abs(cw[cand[q]] / cw[-1] - f)
                    if d > 0.25:
                        continue
                    nxt.append((cost + d, picks + [cand[q]], q + 1))
            nxt.sort(key=lambda x: x[0])
            states = nxt[:400]
        _, picks, _ = min(states, key=lambda x: x[0])
        groups, start, merged, cs = [], 0, [], chunks[0][0]
        for j, pk in enumerate(picks):
            if pk is None:
                continue
            groups.append(list(range(start, pk)))
            merged.append((cs, chunks[j][1]))
            start, cs = pk, chunks[j + 1][0]
        groups.append(list(range(start, n)))
        merged.append((cs, chunks[-1][1]))
        chunks = merged
    out = []
    for g, (s, e) in zip(groups, chunks):
        ws = [weight(words[i]) for i in g]
        tot = sum(ws) or 1
        t = s
        for i, wgt in zip(g, ws):
            d = (e - s) * wgt / tot
            out.append({"w": words[i], "start": round(t, 3), "end": round(t + d * 0.92, 3)})
            t += d
    return out


def whisper_words(path):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    model = WhisperModel("small", compute_type="int8")
    segs, _ = model.transcribe(str(path), language="id", word_timestamps=True)
    return [(w.start, w.end) for s in segs for w in s.words]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    tail = float(sys.argv[sys.argv.index("--tail") + 1]) if "--tail" in sys.argv else 2.2
    naskah = json.loads((ROOT / "tts" / "naskah.json").read_text(encoding="utf-8"))["scenes"]
    out_dir = ROOT / "public" / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    mp3 = out_dir / "voiceover.mp3"
    run(["ffmpeg", "-y", "-i", str(src), "-ac", "1", "-ar", "44100", "-b:a", "160k", str(mp3)])
    total = duration(mp3)
    sil = silences(mp3)
    voice_start = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    voice_end = sil[-1][0] if sil and sil[-1][1] > total - 0.05 else total
    inner = [s for s in sil if s[0] > voice_start + 0.1 and s[1] < voice_end - 0.1]
    need = len(naskah) - 1
    gaps = sorted(sorted(inner, key=lambda s: s[1] - s[0], reverse=True)[:need])
    if len(gaps) < need:
        sys.exit(f"Hanya ketemu {len(gaps)} jeda, butuh {need}. Beri jeda lebih panjang antar-scene.")
    print("Jeda antar-scene (dtk):", ", ".join(f"{s:.2f}-{e:.2f}" for s, e in gaps))
    # batas scene = tengah jeda; awal = 0, akhir = suara selesai + tail
    bounds = [0.0] + [(s + e) / 2 for s, e in gaps] + [voice_end + tail]
    fb = [round(b * FPS) for b in bounds]
    wtimes = whisper_words(mp3)
    scenes, wi = [], 0
    for i, sc in enumerate(naskah):
        a, b = bounds[i], bounds[i + 1]
        speech_a = gaps[i - 1][1] if i > 0 else voice_start
        speech_b = gaps[i][0] if i < need else voice_end
        words = sc["text"].split()
        if wtimes and wi + len(words) <= len(wtimes):
            ws = [{"w": w, "start": round(wtimes[wi + j][0] - a, 3), "end": round(wtimes[wi + j][1] - a, 3)} for j, w in enumerate(words)]
            wi += len(words)
        else:
            chunks = speech_chunks(speech_a, speech_b, sil)
            ws = [{**w, "start": round(w["start"] - a, 3), "end": round(w["end"] - a, 3)} for w in align_words(words, chunks)]
        frames = fb[i + 1] - fb[i]
        scenes.append({"id": sc["id"], "file": "voiceover.mp3", "duration": round((frames - 0.001) / FPS, 4), "words": ws})
        print(f"  {sc['id']}: {frames / FPS:5.2f} dtk ({len(words)} kata)")
    (out_dir / "timing.json").write_text(json.dumps({"voiceover": "voiceover.mp3", "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Total {fb[-1] / FPS:.2f} dtk -> public/audio/timing.json" + (" (timing kata: Whisper)" if wtimes else " (timing kata: perkiraan dari jeda)"))


if __name__ == "__main__":
    main()
