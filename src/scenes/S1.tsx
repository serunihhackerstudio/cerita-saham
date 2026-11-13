// S1 HOOK: monitor pasien = grafik harga turun, Si Menara sakit di ranjang, polling muncul di "sakit".
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp, shake} from '../components';
import {Cursor, GridBg, Mascot, Panel, Pill, Poll, PriceLine} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

// jalur harga ilustratif dari Rp3.770 (Jan) ke Rp2.050 (Nov), titik antara bukan data harian
const PATH = [3770, 3700, 3540, 3320, 3100, 2900, 2760, 2540, 2300, 1950, 2050];

export const S1: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const drop = wordFrame(t, 'setengah', 0.25, dur);
  const why = wordFrame(t, 'kok', 0.42, dur);
  const sick = wordFrame(t, 'sakit', 0.8, dur);
  const sh = shake(f, [drop], 10);
  const cx = interpolate(f, [sick + 6, sick + 26, sick + 46, Math.max(dur, sick + 47)], [700, 400, 690, 560], clamp);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={4} name="beep" volume={0.35} />
      <Sfx at={drop} name="alarm" volume={0.35} />
      <Sfx at={sick} name="pop" volume={0.6} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <Panel x={60} y={190} w={960} h={450}>
          <div style={{position: 'absolute', left: 36, top: 26, fontFamily: MONO, fontSize: 28, color: C.dim, letterSpacing: 2}}>
            MONITOR PASIEN · TLKM 2026
          </div>
          <div style={{position: 'absolute', left: 36, top: 76, fontFamily: MONO, fontSize: 32, color: C.white}}>Rp3.770</div>
          <PriceLine x={60} y={140} w={840} h={250} data={PATH} a={6} b={drop + 6} color={C.siren} />
          {f >= drop && (
            <div style={{position: 'absolute', right: 40, top: 40, textAlign: 'right'}}>
              <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: C.siren, lineHeight: 1}}>−46%</div>
              <div style={{fontFamily: MONO, fontSize: 32, color: C.white}}>Rp2.050</div>
            </div>
          )}
        </Panel>
        <Pill text="Kenapa?" at={why} top={560} />

        {/* ranjang */}
        <div style={{position: 'absolute', left: 250, top: 1090, width: 580, height: 24, background: C.dim, borderRadius: 12}} />
        <Mascot x={390} y={660} scale={0.95} mood="sick" compress thermo signal={0.1} tilt={-4} />
        <div style={{position: 'absolute', left: 270, top: 990, width: 540, height: 110, background: '#3B5B9A', borderRadius: 28}} />
      </AbsoluteFill>

      <Poll
        at={sick}
        top={1150}
        options={[
          {label: 'Sakit beneran?', color: C.siren},
          {label: 'Masuk angin?', color: C.tape},
        ]}
        pick={-1}
      />
      <Cursor x={cx} y={1290} at={sick + 6} />
    </AbsoluteFill>
  );
};
