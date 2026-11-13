// S5: organ sehat. Data & internet +8,3%, server berlari di treadmill, speedometer data center +17%.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp} from '../components';
import {Card, GridBg, Mascot, idNum, useCount} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const Gauge: React.FC<{x: number; y: number; r: number; value: number; max: number; label: string}> = ({x, y, r, value, max, label}) => {
  const a = -180 + (Math.min(value, max) / max) * 180; // derajat dari kiri
  const rad = (a * Math.PI) / 180;
  return (
    <div style={{position: 'absolute', left: x - r - 20, top: y - r - 20, width: r * 2 + 40, height: r + 140}}>
      <svg width={r * 2 + 40} height={r + 40} aria-hidden>
        <g transform={`translate(${r + 20},${r + 20})`}>
          <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={C.steel} strokeWidth={34} />
          <path
            d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`}
            fill="none"
            stroke={C.scan}
            strokeWidth={34}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.min(value, max) / max}
          />
          <line x1={0} y1={0} x2={Math.cos(rad) * (r - 30)} y2={Math.sin(rad) * (r - 30)} stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          <circle r={16} fill={C.white} />
        </g>
      </svg>
      <div style={{textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 72, color: C.scan, marginTop: -6}}>+{idNum(value, 0)}%</div>
      <div style={{textAlign: 'center', fontFamily: MONO, fontSize: 26, color: C.dim}}>{label}</div>
    </div>
  );
};

export const S5: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const data = wordFrame(t, 'data', 0.3, dur);
  const dc = wordFrame(t, 'ngebut', 0.62, dur);
  const pct = useCount(dc, dc + 35, 0, 17);
  const run = f >= dc - 10;
  const leg = run ? Math.sin(f / 2.5) * 22 : 0;
  const belt = run ? (f * 9) % 60 : 0;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <GridBg />
      <Sfx at={data} name="ding" volume={0.45} />
      <Sfx at={dc} name="whoosh" volume={0.5} />

      <Card x={90} y={210} w={900} at={data - 4} label="DATA, INTERNET & IT SERVICES" value="+8,3%" color={C.scan} sub="Rp71,5 T · Jan–Sep 2026" />

      {/* server di treadmill */}
      <div style={{position: 'absolute', left: 90, top: 520, width: 440, height: 600}}>
        <div style={{position: 'absolute', left: 70, top: 40 + (run ? Math.abs(Math.sin(f / 2.5)) * -10 : 0), width: 220, height: 330, background: C.steel, borderRadius: 22, border: `6px solid ${C.white}`, boxSizing: 'border-box'}}>
          {/* ikat kepala */}
          <div style={{position: 'absolute', left: -6, right: -6, top: 20, height: 24, background: C.siren}} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{position: 'absolute', left: 24, right: 24, top: 70 + i * 60, height: 36, background: '#1E2942', borderRadius: 8}}>
              <div style={{position: 'absolute', right: 12, top: 11, width: 14, height: 14, borderRadius: 7, background: (Math.floor(f / 4) + i) % 3 === 0 ? C.scan : '#2E3B57'}} />
            </div>
          ))}
        </div>
        <svg width={440} height={600} style={{position: 'absolute', inset: 0}} aria-hidden>
          <g stroke={C.white} strokeWidth={12} strokeLinecap="round">
            <line x1={150} y1={370} x2={150 + leg} y2={450} />
            <line x1={230} y1={370} x2={230 - leg} y2={450} />
          </g>
          <rect x={20} y={455} width={400} height={40} rx={20} fill="#1E2942" />
          {Array.from({length: 8}).map((_, i) => (
            <line key={i} x1={40 + ((i * 60 - belt + 480) % 480) * 0.8} y1={475} x2={60 + ((i * 60 - belt + 480) % 480) * 0.8} y2={475} stroke={C.dim} strokeWidth={6} />
          ))}
          <line x1={400} y1={470} x2={400} y2={300} stroke={C.dim} strokeWidth={10} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: MONO, fontSize: 26, color: C.dim}}>
          data center
        </div>
      </div>

      {f >= dc - 4 && <Gauge x={790} y={720} r={190} value={pct} max={25} label="PENDAPATAN DATA CENTER" />}

      <Mascot x={700} y={850} scale={0.6} mood={f >= data ? 'ok' : 'meh'} signal={0.7} />
    </AbsoluteFill>
  );
};
