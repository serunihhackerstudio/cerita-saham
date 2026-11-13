"""Efek suara tambahan untuk video explainer 3D (orisinal, dibuat dari sintesis):
python tts/make_extra_sfx.py public/sfx
  bed_soft.wav  musik latar lembut (pad akor mayor, loop 16 dtk)
  zap.wav       busur listrik (derak + dengung)
"""
import os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(11)
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
os.makedirs(OUT, exist_ok=True)

def lp(x, f, o=4):
    b, a = butter(o, f / (SR / 2), "low"); return lfilter(b, a, x)

def hp(x, f, o=4):
    b, a = butter(o, f / (SR / 2), "high"); return lfilter(b, a, x)

def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    if x.ndim == 1: x = np.stack([x, x], 1)
    wavfile.write(f"{OUT}/{name}.wav", SR, (x * 32767).astype(np.int16))

def T(d): return np.arange(int(d * SR)) / SR

# bed_soft: progresi I–V–vi–IV (C mayor), pad sinus lembut + petikan ringan, 16 dtk (loop mulus)
t = T(16.0)
chords = [[261.63, 329.63, 392.00], [196.00, 246.94, 293.66], [220.00, 261.63, 329.63], [174.61, 220.00, 261.63]]
pad = np.zeros_like(t)
for i, ch in enumerate(chords):
    seg = (t >= i * 4) & (t < (i + 1) * 4)
    tt = t[seg] - i * 4
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (4 - tt) / 0.6)
    for k, f in enumerate(ch):
        pad[seg] += env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt + k)) / 3
pluck = np.zeros_like(t)
for n in range(32):
    st = n * 0.5
    ch = chords[int(st // 4)]
    f = ch[n % 3] * 2
    idx = (t >= st)
    tt = t[idx] - st
    pluck[idx] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25) * 0.35
x = lp(pad * 0.8 + pluck, 3500)
fade = np.minimum(1, t / 0.05) * np.minimum(1, (16 - t) / 0.05)
save("bed_soft", x * fade, 0.6)

# zap: derak busur listrik 0,6 dtk
t = T(0.6)
crackle = rng.standard_normal(len(t)) * (rng.random(len(t)) < 0.08)
crackle = hp(crackle, 1500) * 3
hum = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.4 + np.sin(2 * np.pi * 50 * t) * 0.3
noise = hp(rng.standard_normal(len(t)), 2500) * 0.5
env = np.exp(-t / 0.22) * np.minimum(1, t / 0.004)
save("zap", (crackle + hum + noise) * env, 0.9)
print("bed_soft.wav, zap.wav ->", OUT)
