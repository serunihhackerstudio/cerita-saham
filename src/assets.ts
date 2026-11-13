// Foto opsional (hanya yang kamu punya hak pakainya). Taruh di public/img/ lalu isi namanya.
// null = komponen PersonSlot memakai siluet.
export const PHOTOS: Record<string, string | null> = {
  // contoh: tokoh1: "tokoh1.jpg",
};
export const photo = (key: string): string | null => PHOTOS[key] ?? null;
