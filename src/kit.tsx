// Komponen gaya "flat 2D motion explainer" untuk video edukasi saham.
// Maskot Si Menara adalah karakter orisinal (tanpa logo perusahaan mana pun).
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './components';
import {BODY, C, HEAD, MONO} from './theme';

/** Pegas masuk standar (0 → 1) mulai di frame `at`. */
export const usePop = (at: number, stiff = 200) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 12, stiffness: stiff, mass: 0.6}});
};

/** Format angka Indonesia, mis. 113.5 → "113,5". */
export const idNum = (v: number, dec = 1) =>
  v.toLocaleString('id-ID', {minimumFractionDigits: dec, maximumFractionDigits: dec});

/** Angka berjalan dari `from` ke `to` antara frame a..b. */
export const useCount = (a: number, b: number, from: number, to: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});
};

// ---------------------------------------------------------------- Maskot
export type Mood = 'sick' | 'meh' | 'ok' | 'happy';

const MOUTH: Record<Mood, string> = {
  sick: 'M122 168 q7 -7 14 0 t14 0 t14 0 t14 0',
  meh: 'M126 166 L174 166',
  ok: 'M124 160 Q150 178 176 160',
  happy: 'M120 156 Q150 196 180 156 Z',
};

/** Si Menara: menara sinyal kartun. Titik (x, y) = pojok kiri atas kotak 300×460 sebelum skala. */
export const Mascot: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mood?: Mood;
  tilt?: number;
  compress?: boolean;
  thermo?: boolean;
  scratch?: boolean;
  signal?: number; // 0..1, kekuatan sinyal di atas kepala
  opacity?: number;
  flip?: boolean;
}> = ({x, y, scale = 1, mood = 'ok', tilt = 0, compress, thermo, scratch, signal = 0.6, opacity = 1, flip}) => {
  const f = useCurrentFrame();
  const blink = f % 96 > 90 ? 0.15 : 1;
  const bob = Math.sin(f / 14) * 4;
  const sick = mood === 'sick';
  const scratchRot = scratch ? Math.sin(f / 3) * 14 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        width: 300,
        height: 460,
        transformOrigin: '150px 460px',
        transform: `scale(${scale}) rotate(${tilt}deg) ${flip ? 'scaleX(-1)' : ''}`,
        opacity,
      }}
    >
      <svg width={300} height={460} viewBox="0 0 300 460" aria-hidden>
        {/* sinyal */}
        <g fill="none" stroke={signal > 0.5 ? C.scan : C.dim} strokeWidth={10} strokeLinecap="round">
          <path d="M112 30 A52 52 0 0 1 188 30" opacity={signal > 0.15 ? 1 : 0.25} />
          <path d="M88 8 A86 86 0 0 1 212 8" opacity={signal > 0.6 ? 0.7 : 0.15} />
        </g>
        {/* kaki rangka */}
        <g fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
          <path d="M120 200 L70 450 M180 200 L230 450" />
          <path d="M104 280 L196 280 M90 350 L210 350 M78 410 L222 410" />
          <path d="M104 280 L210 350 M196 280 L90 350 M90 350 L222 410 M210 350 L78 410" strokeWidth={6} opacity={0.6} />
        </g>
        {/* kepala */}
        <circle cx={150} cy={130} r={78} fill={C.paper} />
        <circle cx={150} cy={130} r={78} fill="none" stroke={C.white} strokeWidth={6} />
        {sick && <circle cx={108} cy={150} r={13} fill={C.siren} opacity={0.35} />}
        {sick && <circle cx={192} cy={150} r={13} fill={C.siren} opacity={0.35} />}
        {/* mata */}
        {sick ? (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M112 122 q12 8 24 0" />
            <path d="M164 122 q12 8 24 0" />
          </g>
        ) : (
          <g fill={C.ink}>
            <ellipse cx={124} cy={120} rx={11} ry={14 * blink} />
            <ellipse cx={176} cy={120} rx={11} ry={14 * blink} />
            <circle cx={128} cy={114} r={3.5} fill={C.white} opacity={blink > 0.5 ? 1 : 0} />
            <circle cx={180} cy={114} r={3.5} fill={C.white} opacity={blink > 0.5 ? 1 : 0} />
          </g>
        )}
        {/* mulut */}
        <path
          d={MOUTH[mood]}
          fill={mood === 'happy' ? C.ink : 'none'}
          stroke={C.ink}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* kompres */}
        {compress && <rect x={102} y={50} width={96} height={30} rx={10} fill="#8FB8FF" stroke={C.white} strokeWidth={4} />}
        {/* termometer di mulut */}
        {thermo && (
          <g>
            <line x1={170} y1={168} x2={232} y2={196} stroke={C.white} strokeWidth={10} strokeLinecap="round" />
            <line x1={190} y1={177} x2={232} y2={196} stroke={C.siren} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* tangan menggaruk kepala */}
        {scratch && (
          <g transform={`rotate(${scratchRot} 232 120)`}>
            <path d="M200 230 Q250 190 236 104" fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
            <circle cx={236} cy={100} r={14} fill={C.white} />
          </g>
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- Panel & teks
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  color?: string;
  at: number;
  sub?: string;
  valueSize?: number;
}> = ({x, y, w, label, value, color = C.white, at, sub, valueSize = 84}) => {
  const f = useCurrentFrame();
  const s = usePop(at);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        boxSizing: 'border-box',
        background: C.steel,
        borderRadius: 28,
        padding: '26px 32px',
        transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{fontFamily: MONO, fontSize: 28, color: C.dim, letterSpacing: 2}}>{label}</span>
      <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: valueSize, color, lineHeight: 1.05}}>{value}</span>
      {sub && <span style={{fontFamily: MONO, fontSize: 28, color: C.white}}>{sub}</span>}
    </div>
  );
};

/** Pil teks layar (teks besar ringkas). */
export const Pill: React.FC<{text: string; at: number; top: number; bg?: string; color?: string; size?: number}> = ({
  text,
  at,
  top,
  bg = C.tape,
  color = C.ink,
  size = 64,
}) => {
  const f = useCurrentFrame();
  const s = usePop(at, 260);
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: bg,
          color,
          fontFamily: HEAD,
          fontWeight: 800,
          fontSize: size,
          padding: '10px 30px 14px',
          borderRadius: 20,
          transform: `scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(-2deg)`,
          opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Interaktif
/** Kursor tangan; `taps` = frame saat mengetuk (ada riak). */
export const Cursor: React.FC<{x: number; y: number; taps?: number[]; at?: number}> = ({x, y, taps = [], at = 0}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const tap = taps.find((t) => f >= t && f < t + 14);
  const press = tap !== undefined ? interpolate(f - tap, [0, 4, 10], [1, 0.82, 1], clamp) : 1;
  const ring = tap !== undefined ? interpolate(f - tap, [0, 14], [0, 1], clamp) : 0;
  return (
    <div style={{position: 'absolute', left: x - 20, top: y - 10, width: 90, height: 110}}>
      {tap !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: 20 - 50 * ring,
            top: 10 - 50 * ring,
            width: 100 * ring,
            height: 100 * ring,
            borderRadius: '50%',
            border: `5px solid ${C.white}`,
            opacity: 1 - ring,
          }}
        />
      )}
      <svg width={90} height={110} viewBox="0 0 90 110" style={{transform: `scale(${press})`, transformOrigin: '20px 10px'}} aria-hidden>
        <path
          d="M20 10 L20 78 L36 64 L48 92 L60 86 L48 58 L70 58 Z"
          fill={C.white}
          stroke={C.ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/** Stiker polling dua pilihan ala media sosial. `pick` = indeks yang menyala (-1 = belum). */
export const Poll: React.FC<{
  at: number;
  top: number;
  question?: string;
  options: {label: string; color: string}[];
  pick?: number;
  w?: number;
}> = ({at, top, question, options, pick = -1, w = 820}) => {
  const f = useCurrentFrame();
  const s = usePop(at, 220);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: (1080 - w) / 2,
        width: w,
        boxSizing: 'border-box',
        background: C.white,
        borderRadius: 34,
        padding: '24px 26px 26px',
        transform: `scale(${interpolate(s, [0, 1], [0.5, 1])}) rotate(${interpolate(s, [0, 1], [-8, -1.5])}deg)`,
        opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {question && (
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, color: C.ink, textAlign: 'center'}}>{question}</div>
      )}
      <div style={{display: 'flex', gap: 18}}>
        {options.map((o, i) => (
          <div
            key={o.label}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: HEAD,
              fontWeight: 800,
              fontSize: 44,
              padding: '20px 10px',
              borderRadius: 22,
              background: pick === i ? o.color : '#E3E7F0',
              color: pick === i ? C.ink : '#3A4358',
              transform: `scale(${pick === i ? 1.05 : 1})`,
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Grafik garis harga yang digambar bertahap. */
export const PriceLine: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  data: number[];
  a: number;
  b: number;
  color: string;
}> = ({x, y, w, h, data, a, b, color}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const str = pts.map((q) => q.join(',')).join(' ');
  const idx = Math.min(pts.length - 1, Math.floor(p * (pts.length - 1)));
  return (
    <svg width={w + 40} height={h + 40} style={{position: 'absolute', left: x - 20, top: y - 20}} aria-hidden>
      <g transform="translate(20,20)">
        <polyline
          points={str}
          fill="none"
          stroke={color}
          strokeWidth={9}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
        {p > 0 && <circle cx={pts[idx][0]} cy={pts[idx][1]} r={14} fill={color} />}
      </g>
    </svg>
  );
};

/** Panel latar bergaya monitor/kartu besar. */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; color?: string}> = ({
  x,
  y,
  w,
  h,
  children,
  color = C.steel,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: color, borderRadius: 36, overflow: 'hidden'}}>
    {children}
  </div>
);

/** Latar grid halus dipakai semua scene. */
export const GridBg: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} aria-hidden>
    <defs>
      <pattern id="g" width="90" height="90" patternUnits="userSpaceOnUse">
        <path d="M90 0H0V90" fill="none" stroke="#131B2E" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="url(#g)" />
  </svg>
);
