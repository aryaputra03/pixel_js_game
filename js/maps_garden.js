// ============================================
// maps_garden.js — Taman Bunga (Map 3)
// Birthday Quest RPG
//
// Tile legend:
//   0 = rumput (walkable)
//   1 = pagar / tembok (solid)
//   2 = pintu keluar → kembali ke café (walkable)
//   3 = jalan setapak batu (walkable, visual berbeda)
//   4 = bunga merah (solid — dekorasi)
//   5 = bunga kuning (solid — dekorasi)
//   6 = bunga ungu (solid — dekorasi)
//   7 = bunga putih (solid — dekorasi)
//   8 = pohon / semak (solid)
//   9 = kolam kecil (solid — dekorasi)
//
// Perubahan:
//   - GARDEN_NPCS: array 2 hewan NPC di taman
//       kucing    → col 6, row 3 (dekat kolam, di setapak)
//       hamster   → col 11, row 6 (area terbuka pojok kanan)
// ============================================

export const TILE_SIZE_GARDEN = 32;

export const GARDEN_MAP_DATA = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 0 — pagar atas
  [1, 4, 4, 0, 0, 5, 5, 0, 0, 6, 6, 0, 0, 7, 1], // row 1 — bunga baris atas
  [1, 4, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1], // row 2 — setapak kiri
  [1, 0, 0, 8, 3, 0, 0, 9, 0, 3, 8, 0, 5, 0, 1], // row 3 — pohon + kolam (kucing di col 6)
  [1, 5, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 6, 1], // row 4 — taman tengah
  [2, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1], // row 5 — pintu masuk + setapak
  [1, 6, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 5, 1], // row 6 — kolam tengah (hamster di col 11)
  [1, 0, 0, 8, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 1], // row 7 — pohon bawah
  [1, 7, 4, 0, 0, 5, 0, 0, 6, 0, 0, 4, 0, 7, 1], // row 8 — bunga baris bawah
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 9 — pagar bawah
];

// Spawn player masuk dari pintu kiri (col 1, row 5)
export const GARDEN_SPAWN = { col: 1, row: 5 };

// Pintu keluar kembali ke café (col 0, row 5)
export const GARDEN_EXIT_DOOR = { col: 0, row: 5 };

export const GARDEN_ROOM_LABELS = [
  { name: 'Taman Bunga', col: 5, row: 2 },
  { name: 'Kolam Koi', col: 5, row: 6 },
];

// ============================================
// NPC HEWAN DI TAMAN                                     ← BARU
//
// Dua hewan NPC yang bisa diajak "ngobrol" (didekati):
//
// 🐱 Kucing — duduk santai di dekat kolam (col 6 row 3)
//    Tile di sana = 0 (rumput), posisinya di antara
//    kolam dan setapak — tempat kucing suka duduk.
//    Tidak bergerak, tapi animasi ekor / mata berkedip.
//
// 🐹 Hamster — berlarian di area terbuka pojok kanan (col 11 row 6)
//    Tile di sana = 0 (rumput), di pojok kanan tengah.
//    Animasi berlari di tempat, pipi chubby.
//
// dialogId mengacu ke DIALOGS di dialogs.js.
// Tambahkan entry 'garden_cat' dan 'garden_hamster'
// (template sudah ada di file terpisah).
// ============================================
export const GARDEN_NPCS = [
  {
    id: 'garden_cat',
    col: 6,
    row: 3,
    dialogId: 'garden_cat', // key di DIALOGS
    label: '🐱 Kucing',
    type: 'cat', // dipakai renderer untuk pilih sprite
  },
  {
    id: 'garden_hamster',
    col: 11,
    row: 6,
    dialogId: 'garden_hamster', // key di DIALOGS
    label: '🐹 Hamster',
    type: 'hamster',
  },
];
