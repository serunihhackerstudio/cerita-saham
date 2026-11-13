// S6: dompet dibuka (kas Rp54,5 T), timbangan kas vs utang jatuh tempo ±Rp30 T.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp} from '../components';
import {GridBg, Pill, idNum, useCount, usePop} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const Pan: React.FC<{x: number; y: number; title: string; value: string; color: string}> = ({x, y, title, value, color}) => (
  <div style={{position: 'absolute', left: x - 170, top: y, width: 340, textAlign: 'center'}}>
    <svg width={340} height={90} aria-hidden>
      <line x1={170} y1={0} x2={40} y2={70} stroke={C.dim} strokeWidth={4} />
      <line x1={170} y1={0} x2={300} y2={70} stroke={C.dim} strokeWidth={4} />
      <path d="M20 70 H320 Q300 90 170 90 Q40 90 20 70 Z" fill={C.steel} stroke={C.white} strokeWidth={4} />
    </svg>
    <div style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginTop: 8}}>{title}</div>
    <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 52, color}}>{value}</div>
  </div>
);

export const S6: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const open = wordFrame(t, 'tebal', 0.12, dur);
  const kas = wordFrame(t, 'kasnya', 0.32, dur);
  const debt = wordFrame(t, 'utang', 0.6, dur);
  const ok = wordFrame(t, 'tiga', 0.85, dur);
  const flap = interpolate(f, [open, open + 14], [0, -150], clamp);
  const cash = useCount(kas, kas + 35, 0, 54.5);
  const rise = interpolate(f, [kas, kas + 30], [0, 1], clamp);
  const tilt = interpolate(f, [debt + 6, ok + 10], [0, -10], clamp); // kiri (kas) lebih berat
  const showScale = usePop(debt - 6);
  const rad = (tilt * Math.PI) / 180;
  const L = 300;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={open} name="whoosh" volume={0.4} />
      <Sfx at={kas} name="coin" volume={0.5} />
      <Sfx at={ok + 10} name="ding" volume={0.45} />

      {/* dompet */}
      <div style={{position: 'absolute', left: 190, top: 240, width: 700, height: 360}}>
        {/* uang naik */}
        <div style={{position: 'absolute', left: 120, top: 120 - rise * 150, width: 460, height: 180}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: i * 18, top: i * 14, width: 400, height: 150, borderRadius: 14, background: '#2BA866', border: `4px solid ${C.scan}`}} />
          ))}
          {f >= kas && (
            <div style={{position: 'absolute', left: 30, top: 40, fontFamily: HEAD, fontWeight: 800, fontSize: 80, color: C.white}}>Rp{idNum(cash)} T</div>
          )}
        </div>
        <div style={{position: 'absolute', left: 0, top: 150, width: 700, height: 210, background: '#7A4A2B', borderRadius: 30, border: `6px dashed #C89A6A`, boxSizing: 'border-box'}} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 150,
            width: 700,
            height: 110,
            background: '#8E5834',
            borderRadius: 30,
            transformOrigin: '350px 0px',
            transform: `perspective(900px) rotateX(${flap}deg)`,
          }}
        />
      </div>

      {/* timbangan */}
      <div style={{position: 'absolute', inset: 0, opacity: interpolate(showScale, [0, 0.3], [0, 1], clamp)}}>
        <div style={{position: 'absolute', left: 530, top: 760, width: 20, height: 400, background: C.dim, borderRadius: 10}} />
        <div style={{position: 'absolute', left: 430, top: 1150, width: 220, height: 24, background: C.dim, borderRadius: 12}} />
        <div
          style={{
            position: 'absolute',
            left: 540 - L,
            top: 750,
            width: L * 2,
            height: 18,
            background: C.white,
            borderRadius: 9,
            transform: `rotate(${tilt}deg)`,
          }}
        />
        <Pan x={540 - Math.cos(rad) * L} y={760 - Math.sin(rad) * L} title="KAS (JUNI 2026)" value="Rp54,5 T" color={C.scan} />
        <Pan x={540 + Math.cos(rad) * L} y={760 + Math.sin(rad) * L} title="UTANG JATUH TEMPO 12 BLN" value="±Rp30 T" color={C.tape} />
      </div>

      <Pill text="Kas > Utang jatuh tempo" at={ok + 10} top={1190} bg={C.scan} />
      <div style={{position: 'absolute', left: 90, right: 130, top: 1300, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.dim}}>
        Posisi Juni 2026 · sumber: Fitch Ratings
      </div>
    </AbsoluteFill>
  );
};
