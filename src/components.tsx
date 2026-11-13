import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BODY, C, HEAD, MONO} from './theme';
import {VIDEO} from './config';
import {SceneTiming, Word, leadOf} from './timing';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Efek suara satu kali di frame tertentu (relatif scene). */
export const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.7}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Guncangan kamera yang meluruh setelah tiap benturan. */
export const shake = (f: number, impacts: number[], amp = 18) => {
  let x = 0;
  let y = 0;
  for (const i of impacts) {
    const d = f - i;
    if (d >= 0 && d < 16) {
      const k = amp * Math.exp(-d / 4);
      x += (random(`sx${i}-${f}`) - 0.5) * 2 * k;
      y += (random(`sy${i}-${f}`) - 0.5) * 2 * k;
    }
  }
  return {x, y};
};

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.22}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)',
    }}
  />
);

export const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: 0.12,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)',
    }}
  />
);

/** Bilah atas: indikator rekaman + nama akun. */
export const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const on = Math.floor(f / 15) % 2 === 0;
  const s = Math.floor(f / 30);
  const tc = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: MONO,
        fontSize: 26,
        color: C.white,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{width: 18, height: 18, borderRadius: 9, background: C.siren, opacity: on ? 1 : 0.25}} />
        <span style={{letterSpacing: 2}}>{VIDEO.label}</span>
        <span style={{color: C.dim}}>{tc}</span>
      </div>
      <div style={{opacity: 0.85, fontFamily: BODY, fontWeight: 700}}>{VIDEO.brand}</div>
    </div>
  );
};

/** Teks judul yang "dihantamkan" — blok kuning ala garis polisi. */
export const Slam: React.FC<{
  at: number;
  lines: string[];
  top: number;
  size?: number;
  bg?: string;
  color?: string;
}> = ({at, lines, top, size = 112, bg = C.tape, color = C.ink}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      {lines.map((l, i) => {
        const s = spring({frame: f - at - i * 4, fps, config: {damping: 13, stiffness: 240, mass: 0.6}});
        return (
          <div
            key={l}
            style={{
              transform: `scale(${interpolate(s, [0, 1], [1.9, 1])}) rotate(${i % 2 === 0 ? -2 : 1.5}deg)`,
              opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
              background: bg,
              color,
              fontFamily: HEAD,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1,
              padding: '10px 28px 6px',
              textTransform: 'uppercase',
              letterSpacing: 1,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** Stempel tinta. */
export const Stamp: React.FC<{
  at: number;
  text: string;
  color?: string;
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({at, text, color = C.siren, size = 96, rotate = -9, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 12, stiffness: 300, mass: 0.5}});
  return (
    <div
      style={{
        position: 'absolute',
        transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [2.6, 1])})`,
        opacity: interpolate(s, [0, 0.15], [0, 0.95], clamp),
        border: `8px double ${color}`,
        color,
        fontFamily: HEAD,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        padding: '14px 30px 8px',
        letterSpacing: 6,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        mixBlendMode: 'screen',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Foto tokoh (opsional) atau siluet, dengan bidikan target. */
export const PersonSlot: React.FC<{
  photo: string | null;
  w: number;
  h: number;
  tint?: string;
  reticle?: number;
}> = ({photo, w, h, tint = C.siren, reticle = 1}) => {
  const f = useCurrentFrame();
  const inset = interpolate(reticle, [0, 1], [-70, 22]);
  const arm = 70;
  const corner = (pos: React.CSSProperties, bt: string, bl: string): React.ReactNode => (
    <div style={{position: 'absolute', width: arm, height: arm, borderTop: bt, borderLeft: bl, ...pos}} />
  );
  const line = `5px solid ${tint}`;
  return (
    <div style={{width: w, height: h, position: 'relative', overflow: 'hidden', background: C.steel}}>
      {photo ? (
        <>
          <Img
            src={staticFile(`img/${photo}`)}
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.3) brightness(0.85)'}}
          />
          <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply', opacity: 0.35}} />
        </>
      ) : (
        <svg viewBox="0 0 400 460" width={w} height={h} preserveAspectRatio="xMidYMax slice">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#2a323d" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="460" fill="url(#grid)" />
          <circle cx="200" cy="170" r="82" fill="#0b0e12" stroke={tint} strokeOpacity={0.5} strokeWidth="3" />
          <path d="M40 460 C 50 330, 120 280, 200 280 C 280 280, 350 330, 360 460 Z" fill="#0b0e12" stroke={tint} strokeOpacity={0.5} strokeWidth="3" />
          <text x="200" y="182" textAnchor="middle" fontFamily={MONO} fontSize="34" fill={tint} opacity={0.7}>?</text>
        </svg>
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${(f * 1.6) % 110 - 5}%`,
          height: 3,
          background: tint,
          opacity: 0.45,
          boxShadow: `0 0 18px ${tint}`,
        }}
      />
      {corner({left: inset, top: inset}, line, line)}
      {corner({right: inset, top: inset, transform: 'scaleX(-1)'}, line, line)}
      {corner({left: inset, bottom: inset, transform: 'scaleY(-1)'}, line, line)}
      {corner({right: inset, bottom: inset, transform: 'scale(-1,-1)'}, line, line)}
    </div>
  );
};

/** Label nama di bawah foto. */
export const NameTag: React.FC<{name: string; role: string; top: number; opacity?: number}> = ({name, role, top, opacity = 1}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity}}>
    <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 76, color: C.white, lineHeight: 1, textTransform: 'uppercase'}}>{name}</div>
    <div style={{fontFamily: MONO, fontSize: 30, color: C.tape, marginTop: 10}}>{role}</div>
  </div>
);

/** Subtitle per kata, disinkronkan dengan WordBoundary dari Edge TTS. */
export const Captions: React.FC<{t: SceneTiming; until?: number}> = ({t, until}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!t.words.length) return null;
  if (until !== undefined && f >= until) return null;
  const time = (f - leadOf(t.id) * fps) / fps;

  const chunks: Word[][] = [];
  let cur: Word[] = [];
  t.words.forEach((w, i) => {
    cur.push(w);
    const next = t.words[i + 1];
    const longGap = next ? next.start - w.end > 0.35 : true;
    if (cur.length >= 4 || /[.,!?:…]$/.test(w.w) || longGap) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);

  const idx = chunks.findIndex((c, i) => {
    const start = c[0].start - 0.08;
    const end = chunks[i + 1] ? chunks[i + 1][0].start - 0.08 : c[c.length - 1].end + 0.5;
    return time >= start && time < end;
  });
  if (idx < 0) return null;
  const chunk = chunks[idx];

  return (
    <div
      style={{
        position: 'absolute',
        top: 1400,
        left: 70,
        right: 130,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 22px',
      }}
    >
      {chunk.map((w, i) => {
        const nextStart = chunk[i + 1] ? chunk[i + 1].start : w.end + 0.3;
        const active = time >= w.start - 0.03 && time < nextStart;
        const shown = time >= w.start - 0.03;
        return (
          <span
            key={`${w.w}-${w.start}`}
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 60,
              lineHeight: 1.15,
              color: active ? C.tape : C.white,
              opacity: shown ? 1 : 0.35,
              transform: `scale(${active ? 1.05 : 1})`,
              // Outline lewat bayangan (bukan WebkitTextStroke): stroke menggambar garis hitam
              // di dalam huruf pada kontur font yang saling tumpang.
              textShadow: [
                '2px 0 0 #000', '-2px 0 0 #000', '0 2px 0 #000', '0 -2px 0 #000',
                '1.5px 1.5px 0 #000', '-1.5px 1.5px 0 #000', '1.5px -1.5px 0 #000', '-1.5px -1.5px 0 #000',
                '0 5px 0 #000', '0 0 24px rgba(0,0,0,0.9)',
              ].join(', '),
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Kilatan singkat di batas antarscene. */
export const CutFlash: React.FC<{boundaries: number[]}> = ({boundaries}) => {
  const f = useCurrentFrame();
  const b = boundaries.find((x) => f >= x - 1 && f < x + 4);
  if (b === undefined) return null;
  const k = interpolate(f, [b - 1, b, b + 4], [0.25, 0.7, 0], clamp);
  const y = random(`cut${b}${f}`) * 1700;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: C.white, opacity: k * 0.5}} />
      <div style={{position: 'absolute', top: y, left: 0, right: 0, height: 90, background: C.siren, opacity: k}} />
    </AbsoluteFill>
  );
};
