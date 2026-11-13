"""Buat efek suara orisinal: python tts/make_sfx.py public/sfx"""
import os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter
SR=44100
rng=np.random.default_rng(7)
def lp(x,f,o=4):
    b,a=butter(o,f/(SR/2),'low');return lfilter(b,a,x)
def hp(x,f,o=4):
    b,a=butter(o,f/(SR/2),'high');return lfilter(b,a,x)
def env(n,a=0.01,r=0.3):
    t=np.arange(n)/SR;e=np.ones(n)
    ai=int(a*SR);e[:ai]=np.linspace(0,1,ai) if ai>0 else 1
    return e*np.exp(-t/r) if r else e
OUT=sys.argv[1] if len(sys.argv)>1 else "public/sfx"
os.makedirs(OUT,exist_ok=True)
def save(name,x,peak=0.9):
    x=x/np.max(np.abs(x)+1e-9)*peak
    if x.ndim==1:x=np.stack([x,x],1)
    wavfile.write(f'{OUT}/{name}.wav',SR,(x*32767).astype(np.int16))
def T(d):return np.arange(int(d*SR))/SR
# alarm: two-tone emergency siren, 1.4s
t=T(1.4);f=np.where((t*4).astype(int)%2==0,960,720)
ph=2*np.pi*np.cumsum(f)/SR
x=np.sign(np.sin(ph))*0.5+np.sin(ph)*0.5
x=lp(x,4000)*np.minimum(1,t/0.02)*np.minimum(1,(1.4-t)/0.15)
save('alarm',x,0.75)
# whoosh: band-swept noise 0.55s
t=T(0.55);n=rng.standard_normal(len(t))
out=np.zeros_like(n)
for i,c in enumerate(np.linspace(300,5000,12)):
    seg=slice(int(i*len(t)/12),int((i+1)*len(t)/12));out[seg]=lp(hp(n,c*0.5),c)[seg]
x=out*np.sin(np.pi*t/0.55)**2
save('whoosh',x,0.6)
# glitch: crushed bursts 0.7s
t=T(0.7);x=np.zeros_like(t)
for s in rng.uniform(0,0.6,9):
    i=int(s*SR);L=int(rng.uniform(0.02,0.08)*SR)
    burst=np.sign(np.sin(2*np.pi*rng.uniform(80,2500)*np.arange(L)/SR))*rng.uniform(.3,1)
    burst+=rng.standard_normal(L)*0.4
    x[i:i+L]+=burst[:len(x[i:i+L])]
x=np.round(x*6)/6
save('glitch',x,0.6)
# stamp: heavy thud 0.45s
t=T(0.45);x=np.sin(2*np.pi*(90*np.exp(-t*8)+45)*t)*np.exp(-t*9)+lp(rng.standard_normal(len(t)),1800)*np.exp(-t*40)*0.8
save('stamp',x,0.9)
# boom: cinematic impact 3s
t=T(3.0);sub=np.sin(2*np.pi*(55*np.exp(-t*1.2)+30)*t)*np.exp(-t*1.1)
crack=lp(rng.standard_normal(len(t)),900)*np.exp(-t*5)
x=sub+crack*0.9;x=np.tanh(x*1.6)
save('boom',x,0.95)
# hit: short braam-ish accent 1.2s
t=T(1.2);x=sum(np.sign(np.sin(2*np.pi*f*t))*a for f,a in[(55,1),(82.4,.6),(110,.4)])
x=lp(x,700)*np.exp(-t*2.2)*np.minimum(1,t/0.01)
save('hit',x,0.85)
# tick: data clicks 1s
t=T(1.0);x=np.zeros_like(t)
for k in range(22):
    i=int(k*SR/22+rng.uniform(0,300));L=300
    x[i:i+L]+=hp(rng.standard_normal(L),3000)*np.exp(-np.arange(L)/40)
save('tick',x,0.4)
# bed: dark drone with heartbeat pulse, 16s loop
t=T(16.0)
pad=sum(np.sin(2*np.pi*f*t+rng.uniform(0,6))*a for f,a in[(41.2,1),(61.7,.5),(82.4,.35),(123.5,.15),(130.8,.08)])
pad*=0.8+0.2*np.sin(2*np.pi*t/8)
hb=np.zeros_like(t);bt=60/88
for s in np.arange(0,16,bt):
    for off,amp in[(0,1),(0.18,.6)]:
        i=int((s+off)*SR);L=int(0.25*SR);tt=np.arange(L)/SR
        seg=np.sin(2*np.pi*48*tt)*np.exp(-tt*18)*amp
        hb[i:i+L]+=seg[:len(hb[i:i+L])]
air=lp(hp(rng.standard_normal(len(t)),2000),6000)*0.04
x=pad*0.5+hb*0.9+air
fade=int(0.05*SR);x[:fade]*=np.linspace(0,1,fade);x[-fade:]*=np.linspace(1,0,fade)
save('bed',x,0.7)
print('SFX tersimpan di', OUT)
