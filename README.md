# TLKM: Sakit Beneran atau Cuma Lesu? (serunihstudio)

Gaya: edukasi saham, flat 2D motion, maskot orisinal "Si Menara". 9 scene, ±80 detik, 1080×1920 30 fps.

```bash
npm install
pip install edge-tts
npm run tts                         # narasi + public/audio/timing.json (laporkan total durasi)
npm run studio                      # pratinjau
npm run typecheck
npx remotion still Main out/qa/f0060.png --frame=60   # QA beberapa frame
npm run render                      # out/video.mp4
npx remotion still Thumbnail out/thumbnail.png --frame=0
```

Versi final memakai **rekaman suara** (`rekaman/rekaman_tlkm.wav`), bukan TTS per scene.
`public/audio/` tidak disimpan di repo; buat ulang dengan (ffmpeg harus ada di PATH):
```bash
python tts/rekaman_timing.py rekaman/rekaman_tlkm.wav   # voiceover.mp3 + batas scene dari jeda
python tts/align_edge.py                                # timing kata subtitle: Edge TTS + DTW
```

Efek suara & musik ada di `public/sfx` (tidak disimpan di repo) (dibuat ulang: `python tts/make_sfx.py public/sfx && python tts/make_extra_sfx.py public/sfx && python tts/make_soft_sfx.py public/sfx`).

Kemas + unggah (skill serunihstudio-produksi):
```bash
python <skill>/scripts/finalize.py --project . --slug saham-telkom-sakit-atau-lesu
python <skill>/scripts/upload_gdrive.py out/<tanggal>_saham-telkom-sakit-atau-lesu
```
