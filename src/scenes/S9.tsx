// S9 CTA: polling BELI vs JUAL, kursor bolak-balik lalu berhenti di tengah, Si Menara memegang papan, disclaimer.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp} from '../components';
import {Cursor, GridBg, Mascot, Pill, Poll, usePop} from '../kit';
import {BODY, C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

export const S9: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const giliran = wordFrame(t, 'giliran', 0.08, dur);
  const beli = wordFrame(t, 'beli', 0.5, dur);
  const tulis = wordFrame(t, 'tulis', 0.7, dur);
  const sign = usePop(giliran + 6);
  // kursor bolak-balik di antara dua tombol, lalu berhenti di tengah
  const swing = f >= beli && f < tulis ? Math.sin((f - beli) / 6) : 0;
  const cx = f < tulis ? 540 + swing * 200 : interpolate(f, [tulis, tulis + 10], [540 + swing * 200, 540], clamp);
  const pick = f >= beli && f < tulis ? (swing < 0 ? 0 : 1) : -1;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={giliran} name="pop" volume={0.6} />
      <Sfx at={tulis} name="pop" volume={0.5} />

      <Pill text="Beli atau jual?" at={giliran} top={230} size={76} />
      <Poll
        at={giliran + 4}
        top={420}
        question="Kalau pegang TLKM di harga segini?"
        options={[
          {label: 'BELI', color: C.scan},
          {label: 'JUAL', color: C.siren},
        ]}
        pick={pick}
      />
      <Cursor x={cx} y={600} at={giliran + 10} />
      {f >= tulis + 8 && (
        <div style={{position: 'absolute', left: 560, top: 700, fontFamily: HEAD, fontWeight: 800, fontSize: 90, color: C.tape}}>?</div>
      )}

      {/* Si Menara mengintip dari pojok + papan */}
      <Mascot x={-40} y={760} scale={0.85} mood="happy" tilt={10} signal={0.8} />
      <div
        style={{
          position: 'absolute',
          left: 280,
          top: 960,
          background: C.paper,
          color: C.ink,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 46,
          padding: '22px 34px',
          borderRadius: 18,
          border: `6px solid ${C.tape}`,
          transform: `rotate(-4deg) scale(${interpolate(sign, [0, 1], [0.3, 1])})`,
          opacity: interpolate(sign, [0, 0.2], [0, 1], clamp),
        }}
      >
        kamu yang mutusin
      </div>

      <div style={{position: 'absolute', left: 90, right: 130, top: 1230, textAlign: 'center', fontFamily: MONO, fontSize: 22, lineHeight: 1.45, color: C.dim}}>
        Data: laporan Q3 2026 Telkom, Fitch, media keuangan. Harga per 9 Nov 2026. Bukan ajakan membeli atau menjual.
      </div>
    </AbsoluteFill>
  );
};
