// S4: "rontgen" Si Menara, organ terbesar = Telkomsel pucat, pelanggan keluar dari kartu SIM, kursor ketuk → Laba Q3 −10%.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx, clamp} from '../components';
import {Card, Cursor, idNum, useCount, usePop} from '../kit';
import {C, HEAD, MONO} from '../theme';
import {SceneProps, wordFrame} from '../timing';

const XRAY = '#0D2238';

export const Organ: React.FC<{cx: number; cy: number; rx: number; ry: number; label: string; color: string; glow?: number}> = ({
  cx,
  cy,
  rx,
  ry,
  label,
  color,
  glow = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - rx,
      top: cy - ry,
      width: rx * 2,
      height: ry * 2,
      borderRadius: '50%',
      background: color,
      boxShadow: glow ? `0 0 ${60 * glow}px ${color}` : undefined,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: HEAD,
      fontWeight: 800,
      fontSize: rx > 150 ? 54 : 30,
      color: C.ink,
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

export const S4: React.FC<SceneProps> = ({t, dur}) => {
  const f = useCurrentFrame();
  const name = wordFrame(t, 'telkomsel', 0.18, dur);
  const subs = wordFrame(t, 'pelanggannya', 0.32, dur);
  const q3 = wordFrame(t, 'kuartal', 0.66, dur);
  const zoom = interpolate(f, [0, 24], [1.15, 1], clamp);
  const pulse = f >= name ? 0.5 + 0.5 * Math.sin((f - name) / 5) : 0;
  const n = useCount(subs, subs + 45, 157.6, 151.1);
  const tip = usePop(q3 + 4);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Sfx at={2} name="whoosh" volume={0.3} />
      <Sfx at={name} name="beep" volume={0.35} />
      <Sfx at={q3} name="tick" volume={0.6} />

      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 200,
          width: 900,
          height: 760,
          background: XRAY,
          borderRadius: 36,
          overflow: 'hidden',
          transform: `scale(${zoom})`,
        }}
      >
        <div style={{position: 'absolute', left: 30, top: 22, fontFamily: MONO, fontSize: 28, color: '#7FA6C9', letterSpacing: 2}}>
          RONTGEN · ISI PERUT TELKOM
        </div>
        {/* garis tubuh menara */}
        <svg width={900} height={760} style={{position: 'absolute', inset: 0}} aria-hidden>
          <g fill="none" stroke="#2A4A6E" strokeWidth={10}>
            <path d="M330 120 L170 740 M570 120 L730 740" />
            <circle cx={450} cy={120} r={60} />
          </g>
        </svg>
        <Organ cx={450} cy={400} rx={250} ry={150} label="TELKOMSEL" color={f >= name ? '#E9D9A0' : '#5B6E87'} glow={pulse * 0.6} />
        <Organ cx={210} cy={640} rx={95} ry={70} label="IndiHome" color="#3E5574" />
        <Organ cx={450} cy={660} rx={95} ry={70} label="Data center" color="#3E5574" />
        <Organ cx={690} cy={640} rx={95} ry={70} label="Menara" color="#3E5574" />

        {f >= q3 + 4 && (
          <div
            style={{
              position: 'absolute',
              left: 520,
              top: 180,
              background: C.siren,
              color: C.white,
              fontFamily: HEAD,
              fontWeight: 800,
              fontSize: 46,
              padding: '12px 22px',
              borderRadius: 18,
              transform: `scale(${interpolate(tip, [0, 1], [0.4, 1])})`,
              transformOrigin: 'left bottom',
            }}
          >
            Laba Q3 −10%
          </div>
        )}
      </div>
      <Cursor x={interpolate(f, [q3 - 20, q3], [900, 600], clamp)} y={interpolate(f, [q3 - 20, q3], [1000, 620], clamp)} taps={[q3]} at={q3 - 20} />

      <Card x={90} y={990} w={900} at={subs - 4} label="PELANGGAN TELKOMSEL (Q3)" value={`${idNum(n)} juta`} color={C.white} sub="−4,1% dibanding tahun lalu" />
      {/* pelanggan keluar dari kartu SIM */}
      {f >= subs && (
        <svg width={260} height={220} style={{position: 'absolute', left: 740, top: 990}} aria-hidden>
          <path d="M40 30 H130 L170 70 V190 H40 Z" fill={C.tape} stroke={C.white} strokeWidth={5} />
          <rect x={70} y={95} width={70} height={60} rx={8} fill="#C99A1E" />
          {Array.from({length: 6}).map((_, i) => {
            const st = subs + i * 7;
            const p = interpolate(f, [st, st + 30], [0, 1], clamp);
            return <circle key={i} cx={160 + p * 100} cy={120 + (i % 3 - 1) * 30} r={12} fill={C.white} opacity={p > 0 && p < 1 ? 1 - p : 0} />;
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};
