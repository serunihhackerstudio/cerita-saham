// S3: kartu kuis dibalik 2025 → 2026, tumpukan koin mengempis, stempel LABA −9%.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, Stamp, clamp} from '../components';
import {GridBg, Mascot} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const Face: React.FC<{year: string; value: string; color: string; back?: boolean}> = ({year, value, color, back}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 36,
      background: back ? C.paper : C.steel,
      backfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    }}
  >
    <span style={{fontFamily: MONO, fontSize: 32, color: back ? '#4A5571' : C.dim, letterSpacing: 2}}>LABA BERSIH JAN–SEP {year}</span>
    <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 120, color}}>{value}</span>
  </div>
);

export const S3: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const turun = wordFrame(t, 'turun', 0.15, dur);
  const flipAt = wordFrame(t, 'sekarang', 0.5, dur);
  const nine = wordFrame(t, 'sembilan', 0.82, dur);
  const rot = interpolate(f, [flipAt, flipAt + 14], [0, 180], clamp);
  // 22 koin ≈ Rp15,8 T → 20 koin ≈ Rp14,4 T (proporsional)
  const coins = Math.round(interpolate(f, [flipAt, flipAt + 20], [22, 20], clamp));
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={flipAt} name="whoosh" volume={0.4} />
      <Sfx at={flipAt + 8} name="coin" volume={0.45} />
      <Sfx at={nine} name="stamp" volume={0.7} />

      <div style={{position: 'absolute', left: 110, top: 220, width: 860, height: 320, perspective: 1600}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${rot}deg)`}}>
          <Face year="2025" value="Rp15,8 T" color={C.white} />
          <Face year="2026" value="Rp14,4 T" color={C.siren} back />
        </div>
      </div>

      {/* tumpukan koin */}
      <div style={{position: 'absolute', left: 200, top: 620, width: 360, height: 560}}>
        {Array.from({length: coins}).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 40,
              bottom: i * 22,
              width: 280,
              height: 38,
              borderRadius: '50%',
              background: C.tape,
              border: `5px solid #C99A1E`,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      <Mascot x={640} y={700} scale={0.8} mood="meh" scratch={f >= turun} signal={0.4} />
      {f >= turun && (
        <div
          style={{
            position: 'absolute',
            left: 860,
            top: 640,
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 110,
            color: C.tape,
            transform: `translateY(${Math.sin(f / 6) * 6}px)`,
          }}
        >
          ?
        </div>
      )}

      <Stamp at={nine} text="LABA −9%" color={C.siren} size={110} style={{left: 190, top: 1150}} />
    </AbsoluteFill>
  );
};
