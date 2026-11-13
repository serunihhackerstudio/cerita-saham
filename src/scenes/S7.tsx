// S7: kalkulator mengetik 223 ÷ 2.050 → ≈10,9%, stempel BUKAN JAMINAN.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, Stamp, clamp} from '../components';
import {GridBg} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const EXPR = '223 ÷ 2.050 =';
const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];

export const S7: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const div = wordFrame(t, 'dividen', 0.05, dur);
  const harga = wordFrame(t, 'harga', 0.35, dur);
  const res = wordFrame(t, 'sebelas', 0.55, dur);
  const warn = wordFrame(t, 'dijamin', 0.85, dur);
  const typed = Math.floor(interpolate(f, [harga - 10, res - 4], [0, EXPR.length], clamp));
  const lastChar = EXPR[Math.max(0, typed - 1)];
  const pressed = typed > 0 && f < res ? lastChar : f >= res && f < res + 6 ? '=' : '';
  const ticks = Array.from({length: EXPR.length}, (_, i) => Math.round(harga - 10 + (i * (res - 4 - (harga - 10))) / EXPR.length)).filter((x, i) => EXPR[i] !== ' ');
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      {ticks.map((tk) => (
        <Sfx key={tk} at={tk} name="tick" volume={0.25} />
      ))}
      <Sfx at={res} name="ding" volume={0.5} />
      <Sfx at={warn} name="stamp" volume={0.7} />

      <div style={{position: 'absolute', left: 240, top: 210, width: 600, height: 930, background: C.steel, borderRadius: 48, border: `6px solid #24304B`, boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, height: 280, background: '#C8D5C0', borderRadius: 24, padding: '20px 28px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: MONO, fontSize: 24, color: '#3F4B3A', opacity: f >= div ? 1 : 0}}>dividen TB 2025: Rp223,17/lembar</div>
          <div style={{fontFamily: MONO, fontSize: 52, color: '#1E261B', marginTop: 24, textAlign: 'right'}}>{EXPR.slice(0, typed)}</div>
          <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: '#1E261B', textAlign: 'right', opacity: f >= res ? 1 : 0}}>≈ 10,9%</div>
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 340, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18}}>
          {KEYS.map((k) => (
            <div
              key={k}
              style={{
                height: 118,
                borderRadius: 24,
                background: pressed === k || (k === '.' && pressed === '.') ? C.tape : '#24304B',
                color: pressed === k ? C.ink : C.white,
                fontFamily: HEAD,
                fontWeight: 800,
                fontSize: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${pressed === k ? 0.92 : 1})`,
              }}
            >
              {k}
            </div>
          ))}
        </div>
      </div>

      <Stamp at={warn} text="BUKAN JAMINAN" color={C.tape} size={88} rotate={-8} style={{left: 170, top: 820}} />
      <div style={{position: 'absolute', left: 90, right: 130, top: 1190, textAlign: 'center', fontFamily: MONO, fontSize: 24, color: C.dim}}>
        yield historis = dividen tahun lalu ÷ harga 9 Nov 2026
      </div>
    </AbsoluteFill>
  );
};
