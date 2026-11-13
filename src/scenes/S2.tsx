// S2: stetoskop diperiksa, pendapatan Rp113,5 T (+3,5%), batang dari nol supaya jujur, siput "pelan".
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp} from '../components';
import {Card, GridBg, Mascot, Panel, idNum, useCount, usePop} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const BARS = [
  {year: '2025', v: 109.6, color: C.dim},
  {year: '2026', v: 113.5, color: C.scan},
];

export const S2: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const steth = wordFrame(t, 'periksa', 0.12, dur);
  const num = wordFrame(t, 'seratus', 0.3, dur);
  const slow = wordFrame(t, 'pelan', 0.75, dur);
  const sp = usePop(steth);
  const v = useCount(num, num + 40, 0, 113.5);
  const grow = interpolate(f, [num, num + 40], [0, 1], clamp);
  const snailX = interpolate(f, [slow, dur], [0, 220], clamp);
  const beat = (f % 24) / 24;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={steth} name="beep" volume={0.35} />
      <Sfx at={num} name="tick" volume={0.4} />
      <Sfx at={slow} name="pop" volume={0.4} />

      <Mascot x={30} y={640} scale={0.9} mood="meh" compress signal={0.3} />
      {/* stetoskop */}
      <svg width={1080} height={1300} style={{position: 'absolute', left: 0, top: 0, opacity: interpolate(sp, [0, 0.3], [0, 1], clamp)}} aria-hidden>
        <g transform={`translate(${interpolate(sp, [0, 1], [300, 0])},0)`}>
          <path d="M470 1240 C 470 1000, 330 980, 270 860" fill="none" stroke={C.dim} strokeWidth={12} strokeLinecap="round" />
          <circle cx={262} cy={848} r={30} fill="#C9D1E2" stroke={C.white} strokeWidth={6} />
        </g>
      </svg>
      {/* gelembung detak */}
      {f >= steth + 10 && (
        <div style={{position: 'absolute', left: 60, top: 470, width: 340, height: 120, background: C.steel, borderRadius: 30}}>
          <svg width={340} height={120} aria-hidden>
            <polyline
              points="20,60 110,60 130,60 150,25 172,95 192,45 210,60 320,60"
              fill="none"
              stroke={C.scan}
              strokeWidth={7}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - beat}
            />
          </svg>
        </div>
      )}

      <Card x={460} y={210} w={560} at={num - 6} label="PENDAPATAN JAN–SEP" value={`Rp${idNum(v)} T`} color={C.white} sub="+3,5% vs 2025" />

      <Panel x={460} y={560} w={560} h={640}>
        <div style={{position: 'absolute', left: 30, top: 24, fontFamily: MONO, fontSize: 26, color: C.dim}}>skala dari nol</div>
        {BARS.map((b, i) => {
          const h = (b.v / 120) * 420 * grow;
          return (
            <div key={b.year} style={{position: 'absolute', left: 70 + i * 230, bottom: 110, width: 170}}>
              <div style={{fontFamily: MONO, fontSize: 30, color: C.white, textAlign: 'center', marginBottom: 10, opacity: grow}}>
                {idNum(b.v)}
              </div>
              <div style={{height: h, background: b.color, borderRadius: '16px 16px 0 0'}} />
            </div>
          );
        })}
        {BARS.map((b, i) => (
          <div key={b.year + 'l'} style={{position: 'absolute', left: 70 + i * 230, bottom: 60, width: 170, textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 36, color: C.dim}}>
            {b.year}
          </div>
        ))}
        {/* siput */}
        {f >= slow && (
          <svg width={140} height={80} style={{position: 'absolute', left: 40 + snailX, bottom: 4}} aria-hidden>
            <path d="M10 70 L120 70" stroke={C.dim} strokeWidth={4} />
            <circle cx={70} cy={42} r={26} fill={C.tape} stroke={C.white} strokeWidth={4} />
            <path d="M70 42 m-12 0 a12 12 0 1 1 12 12" fill="none" stroke={C.ink} strokeWidth={4} />
            <path d="M40 68 Q30 50 22 40 M22 40 L18 26 M22 40 L30 28" fill="none" stroke={C.white} strokeWidth={5} strokeLinecap="round" />
          </svg>
        )}
      </Panel>
    </AbsoluteFill>
  );
};
