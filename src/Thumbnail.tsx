// Cover 1080×1920 (TikTok, Reels, Shorts). Teks penting di area tengah 1080×1350 (y 285–1635)
// supaya aman dipotong 4:5. Render: npx remotion still Thumbnail out/thumbnail.png --frame=0
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GridBg, Mascot} from './kit';
import {BODY, C, HEAD, MONO} from './theme';

const card: React.CSSProperties = {
  background: C.steel,
  borderRadius: 26,
  padding: '26px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: C.ink, fontFamily: BODY}}>
    <GridBg />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} aria-hidden>
      <polyline
        points="0,1010 230,1010 270,1010 300,930 335,1110 370,960 400,1040 430,1010 600,1010 640,1010 670,980 700,1180 735,1010 1080,1010"
        fill="none"
        stroke={C.siren}
        strokeWidth={10}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>

    <div style={{position: 'absolute', left: 80, top: 300}}>
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 3,
          background: C.steel,
          color: C.tape,
          padding: '14px 24px',
          borderRadius: 12,
        }}
      >
        BEDAH SAHAM · TLKM
      </span>
    </div>

    <div style={{position: 'absolute', left: 80, right: 80, top: 420, display: 'flex', flexDirection: 'column', gap: 18}}>
      {['TELKOM', 'LAGI'].map((w) => (
        <div key={w} style={{fontFamily: HEAD, fontWeight: 800, fontSize: 168, lineHeight: 0.95, letterSpacing: -4, color: C.white}}>
          {w}
        </div>
      ))}
      <div
        style={{
          alignSelf: 'flex-start',
          fontFamily: HEAD,
          fontWeight: 800,
          fontSize: 168,
          lineHeight: 1,
          letterSpacing: -4,
          background: C.tape,
          color: C.ink,
          padding: '4px 28px 14px',
          borderRadius: 18,
          transform: 'rotate(-2deg)',
        }}
      >
        SAKIT?
      </div>
    </div>

    <Mascot x={700} y={1060} scale={0.85} mood="sick" compress thermo signal={0.1} />

    <div style={{position: 'absolute', left: 80, top: 1130, width: 600, display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={card}>
        <span style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>HARGA SAHAM 2026</span>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: C.siren}}>−46%</span>
        <span style={{fontFamily: MONO, fontSize: 30, color: C.white}}>Rp3.770 → Rp2.050</span>
      </div>
      <div style={card}>
        <span style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>TAPI KAS DI DOMPET</span>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: C.scan}}>Rp54,5 T</span>
      </div>
    </div>

    <div style={{position: 'absolute', left: 80, top: 1560, fontWeight: 700, fontSize: 30, color: C.dim, letterSpacing: 1}}>
      serunihstudio
    </div>
  </AbsoluteFill>
);
