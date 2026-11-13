"""Buat narasi per scene dengan Edge TTS + data waktu per kata untuk subtitle.

Pemakaian:
    pip install edge-tts
    python tts/generate_tts.py                       # suara default dari naskah.json
    python tts/generate_tts.py --voice id-ID-GadisNeural --rate +10%

Hasil: public/audio/s1.mp3 ... s7.mp3 dan public/audio/timing.json
"""
import argparse
import asyncio
import json
import shutil
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"


def probe_duration(path: Path) -> "float | None":
    if shutil.which("ffprobe"):
        r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True,
        )
        try:
            return float(r.stdout.strip())
        except ValueError:
            pass
    try:
        from mutagen.mp3 import MP3  # pip install mutagen (opsional)
        return MP3(str(path)).info.length
    except Exception:
        return None


async def synth(scene: dict, voice: str, rate: str, pitch: str) -> dict:
    path = OUT / f"{scene['id']}.mp3"
    try:
        comm = edge_tts.Communicate(scene["text"], voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    except TypeError:  # edge-tts versi lama: WordBoundary sudah default
        comm = edge_tts.Communicate(scene["text"], voice, rate=rate, pitch=pitch)
    words = []
    with open(path, "wb") as fh:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                fh.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                end = start + chunk["duration"] / 1e7
                words.append({"w": chunk["text"], "start": round(start, 3), "end": round(end, 3)})
    dur = probe_duration(path) or (words[-1]["end"] + 0.25 if words else 0)
    print(f"  {scene['id']}: {dur:5.2f} dtk, {len(words)} kata")
    return {"id": scene["id"], "file": path.name, "duration": round(dur, 3), "words": words}


async def main() -> None:
    cfg = json.loads((ROOT / "tts" / "naskah.json").read_text(encoding="utf-8"))
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=cfg["voice"])
    ap.add_argument("--rate", default=cfg["rate"])
    ap.add_argument("--pitch", default=cfg["pitch"])
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Suara: {a.voice} (rate {a.rate}, pitch {a.pitch})")
    scenes = [await synth(s, a.voice, a.rate, a.pitch) for s in cfg["scenes"]]
    (OUT / "timing.json").write_text(json.dumps({"scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(s["duration"] for s in scenes)
    print(f"Total narasi: {total:.1f} dtk (video ±{total + 6:.0f} dtk dengan jeda). Tersimpan di public/audio/")


if __name__ == "__main__":
    asyncio.run(main())
