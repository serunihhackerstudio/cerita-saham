import {SCENES} from "./config";

export type Word = {w: string; start: number; end: number};
export type SceneTiming = {id: string; file: string | null; duration: number; words: Word[]};
export type Timing = {voiceover?: string; scenes: SceneTiming[]};
export type SceneProps = {t: SceneTiming; dur: number};

export const FPS = 30;

const cfg = (id: string) => {
  const c = SCENES.find((s) => s.id === id);
  if (!c) throw new Error(`Scene ${id} tidak ada di src/config.ts`);
  return c;
};
export const leadOf = (id: string) => cfg(id).lead;
export const tailOf = (id: string) => cfg(id).tail;

export const DEFAULT_TIMING: Timing = {
  scenes: SCENES.map((s) => ({id: s.id, file: null, duration: 0, words: []})),
};

export const sceneFrames = (s: SceneTiming): number => {
  if (!s.file || s.duration <= 0) return Math.round(cfg(s.id).seconds * FPS);
  return Math.ceil((leadOf(s.id) + s.duration + tailOf(s.id)) * FPS);
};

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Frame (relatif scene) saat kata diucapkan; kalau tidak ketemu, pakai fraksi durasi scene. */
export const wordFrame = (t: SceneTiming, match: string, fallbackFrac: number, dur: number): number => {
  const m = norm(match);
  const w = t.words.find((x) => norm(x.w).startsWith(m));
  if (w) return Math.round((leadOf(t.id) + w.start) * FPS);
  return Math.round(fallbackFrac * dur);
};
