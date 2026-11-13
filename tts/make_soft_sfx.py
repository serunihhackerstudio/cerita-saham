"""Efek suara lembut untuk gaya explainer santai (orisinal, sintesis):
python tts/make_soft_sfx.py public/sfx
  pop.wav   letupan stiker/polling
  beep.wav  bip monitor pasien
  ding.wav  lonceng kecil (hasil/oke)
  coin.wav  gemerincing koin
  pen.wav   goresan pulpen
"""
import os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(7)
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
os.makedirs(OUT, exist_ok=True)

def bp(x, lo, hi, o=3):
    b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)

def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    x = np.stack([x, x], 1)
    wavfile.write(f"{OUT}/{name}.wav", SR, (x * 32767).astype(np.int16))

def T(d): return np.arange(int(d * SR)) / SR

t = T(0.18)
f = 500 + 900 * np.exp(-t / 0.03)
save("pop", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05))

t = T(0.22)
save("beep", np.sin(2 * np.pi * 1000 * t) * np.minimum(1, t / 0.005) * np.exp(-np.maximum(0, t - 0.12) / 0.02), 0.6)

t = T(1.2)
ding = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t / d) * g for fr, d, g in [(1318.5, 0.5, 1), (2637, 0.25, 0.4), (1975.5, 0.35, 0.3)])
save("ding", ding * np.minimum(1, t / 0.003), 0.6)

t = T(0.6)
coin = np.zeros_like(t)
for st, fr in [(0.0, 3200), (0.08, 3900), (0.15, 3500), (0.24, 4300)]:
    m = t >= st
    tt = t[m] - st
    coin[m] += (np.sin(2 * np.pi * fr * tt) + 0.5 * np.sin(2 * np.pi * fr * 1.5 * tt)) * np.exp(-tt / 0.07)
save("coin", coin, 0.6)

t = T(0.45)
scratch = bp(rng.standard_normal(len(t)), 2500, 7000) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
save("pen", scratch * np.minimum(1, t / 0.02) * np.minimum(1, (0.45 - t) / 0.08), 0.45)
print("pop, beep, ding, coin, pen ->", OUT)
