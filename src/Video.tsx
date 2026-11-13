import React from "react";
import {AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile, useVideoConfig} from "remotion";
import {Captions, CutFlash, Grain, TopBar, Vignette} from "./components";
import {SCENES} from "./config";
import {SCENE_COMPONENTS} from "./scenes";
import {C} from "./theme";
import {FPS, Timing, leadOf, sceneFrames} from "./timing";

export type VideoProps = {timing: Timing};

// Musik latar lembut: pelan di sela narasi, lebih pelan lagi saat narasi (ducking).
const BED_IDLE = 0.1;
const BED_UNDER_VOICE = 0.05;

export const Video: React.FC<VideoProps> = ({timing}) => {
  const {durationInFrames} = useVideoConfig();
  const frames = timing.scenes.map(sceneFrames);
  const starts = frames.map((_, i) => frames.slice(0, i).reduce((a, b) => a + b, 0));
  const boundaries = starts.slice(1);

  // jendela narasi global [mulai, selesai] dalam frame
  // Pakai stempel waktu kata kalau ada (rekaman satu file: jeda antarscene ikut terekam).
  const voice = timing.scenes
    .map((s, i) => {
      if (!s.file || s.duration <= 0) return null;
      const base = starts[i] + leadOf(s.id) * FPS;
      if (s.words.length) return [base + s.words[0].start * FPS, base + s.words[s.words.length - 1].end * FPS];
      return [base, base + s.duration * FPS];
    })
    .filter((x): x is number[] => x !== null);

  const bedVolume = (f: number) => {
    const fade = interpolate(f, [0, 20, durationInFrames - 70, durationInFrames - 30], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // transisi halus 6 frame masuk/keluar jendela narasi
    let duck = 0;
    for (const [a, b] of voice) {
      duck = Math.max(duck, interpolate(f, [a - 6, a, b, b + 8], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
    }
    return fade * (BED_IDLE + (BED_UNDER_VOICE - BED_IDLE) * duck);
  };

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Series>
        {timing.scenes.map((s, i) => {
          const Scene = SCENE_COMPONENTS[s.id];
          const showCaptions = SCENES.find((c) => c.id === s.id)?.captions !== false;
          return (
            <Series.Sequence key={s.id} durationInFrames={frames[i]}>
              {Scene ? <Scene t={s} dur={frames[i]} /> : <AbsoluteFill style={{background: "#300"}} />}
              {s.file && !timing.voiceover && (
                <Sequence from={Math.round(leadOf(s.id) * FPS)} layout="none">
                  <Audio src={staticFile(`audio/${s.file}`)} />
                </Sequence>
              )}
              {showCaptions && <Captions t={s} />}
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Rekaman satu file: diputar sekali dari awal video */}
      {timing.voiceover && <Audio src={staticFile(`audio/${timing.voiceover}`)} />}
      <Audio src={staticFile("sfx/bed_soft.wav")} loop volume={bedVolume} />

      <CutFlash boundaries={boundaries} />
      <AbsoluteFill style={{opacity: 0.35}}>
        <Vignette />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: 0.55}}>
        <Grain />
      </AbsoluteFill>
      <TopBar />
    </AbsoluteFill>
  );
};
