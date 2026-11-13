// ====== DIISI PER VIDEO ======
// id scene harus sama dengan tts/naskah.json dan src/scenes/index.ts
export const VIDEO = {
  compositionId: "Main",
  brand: "serunihstudio",
  label: "Edukasi Saham",
};

export type SceneConfig = {
  id: string;
  seconds: number; // durasi naskah, dipakai kalau audio TTS belum ada
  lead: number; // jeda (dtk) sebelum narasi mulai
  tail: number; // jeda (dtk) setelah narasi selesai
  captions?: boolean; // false = scene menggambar teksnya sendiri
};

export const SCENES: SceneConfig[] = [
  {id: "s1", seconds: 6, lead: 0, tail: 0}, // hook: saham -46%, poll sakit/masuk angin
  {id: "s2", seconds: 8, lead: 0, tail: 0}, // pendapatan +3,5%
  {id: "s3", seconds: 9, lead: 0, tail: 0}, // laba -9%
  {id: "s4", seconds: 11, lead: 0, tail: 0}, // Telkomsel
  {id: "s5", seconds: 11, lead: 0, tail: 0}, // data & data center
  {id: "s6", seconds: 10, lead: 0, tail: 0}, // kas vs utang
  {id: "s7", seconds: 9, lead: 0, tail: 0}, // dividen
  {id: "s8", seconds: 9, lead: 0, tail: 0}, // diagnosis
  {id: "s9", seconds: 7, lead: 0, tail: 0}, // CTA beli/jual + disclaimer
];

// Thumbnail = komposisi "Thumbnail" (statis, 2D), frame berapa pun hasilnya sama.
export const THUMB = {
  frame: 0,
};
