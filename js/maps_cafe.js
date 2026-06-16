// ============================================
// maps_cafe.js — Café Interior Map Data
// Birthday Quest RPG · Map 2
//
// Tile legend:
//   0 = lantai kayu (walkable)
//   1 = tembok (solid)
//   2 = pintu keluar ke map 1 (walkable, trigger transisi)
//   3 = pintu terkunci (solid sampai NPC Arya diajak ngobrol)
//   4 = meja (solid — furniture)
//   5 = kursi (solid — furniture)
//   6 = counter bar (solid)
//   7 = jendela (solid)
//   8 = tanaman / dekorasi (solid)
//   9 = karpet area (walkable)
//
// Perubahan dari versi sebelumnya:
//   - row 8 col 13 → tile 3 (LOCKED DOOR)
//     Sebelumnya tembok (1), kini pintu terkunci.
//     Hanya bisa dibuka setelah interaksi dengan Arya.
//   - CAFE_LOCKED_DOOR: export posisi & metadata pintu
//   - CAFE_NPCS: array NPC di café, berisi Arya (col 12, row 7)
// ============================================

export const TILE_SIZE_CAFE = 32;

// ============================================
// MAP CAFÉ
//
//  Denah setelah perubahan:
//  ┌─────────────────────────────────┐
//  │  TEMBOK ATAS + JENDELA         │
//  │  ┌──COUNTER BAR──┐            │
//  │  │ mesin kopi    │    AREA    │
//  │  └───────────────┘   DUDUK   │
//  │  Meja1  Meja2     ┌─────┐    │
//  │  [kursi][kursi]   │Meja3│    │
//  │                   └─────┘    │  ← Arya duduk di sini (col 12, row 7)
//  │  [tanaman]   [tanaman]        │
//  ╞EXIT                    [LOCK]═╡  ← col 0 row 5 exit | col 13 row 8 locked
//  └─────────────────────────────────┘
// ============================================

export const CAFE_MAP_DATA = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
  [1, 1, 7, 7, 1, 7, 7, 7, 1, 7, 7, 7, 1, 7, 1], // row 0 — tembok atas + jendela
  [1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1], // row 1 — counter bar penuh
  [1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1], // row 2 — area balik counter (barista)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 3 — divider counter
  [1, 9, 9, 9, 4, 9, 9, 4, 9, 9, 4, 9, 9, 8, 1], // row 4 — karpet + meja + tanaman
  [2, 9, 5, 9, 4, 9, 5, 4, 9, 5, 4, 9, 9, 9, 1], // row 5 — pintu exit + kursi
  [1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1], // row 6 — lorong tengah
  [1, 9, 4, 5, 9, 9, 4, 5, 9, 9, 4, 5, 9, 8, 1], // row 7 — meja + kursi bawah
  [1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 3, 1], // row 8 — lorong bawah + LOCKED DOOR col 13
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 9 — tembok bawah
];

// ============================================
// SPAWN PLAYER — dekat pintu masuk
// ============================================
export const CAFE_SPAWN = { col: 1, row: 5 };

// ============================================
// PINTU KELUAR CAFÉ — kembali ke map 1
// ============================================
export const CAFE_EXIT_DOOR = { col: 0, row: 5 };

// ============================================
// PINTU TERKUNCI DI CAFÉ                      ← BARU
// Posisi: pojok kanan bawah (col 13, row 8)
// Unlock condition: sudah ngobrol dengan NPC Arya
// ============================================
export const CAFE_LOCKED_DOOR = {
  col: 13,
  row: 8,
  leadsTo: 'map_03', // placeholder — diisi saat Map 3 dibuat
};

// ============================================
// NPC DI CAFÉ                                 ← BARU
//
// Arya — pengunjung muda, duduk di pojok kanan bawah
// Posisi: col 12, row 7 (kursi kosong dekat meja kanan bawah)
// Setelah diajak ngobrol → CAFE_LOCKED_DOOR terbuka
// ============================================
export const CAFE_NPCS = [
  {
    id: 'cafe_npc_arya',
    col: 12,
    row: 7,
    dialogId: 'cafe_arya', // key di DIALOGS
    label: 'Arya',
    color: '#5B8CFF', // biru muda — ciri khas karakter muda
    gender: 'male',
    mustInteract: true, // wajib untuk unlock pintu café
  },
];

// ============================================
// ROOM LABELS CAFÉ
// ============================================
export const CAFE_ROOM_LABELS = [
  { name: 'Dapur Kopi', col: 1, row: 1 },
  { name: 'Area Duduk', col: 4, row: 4 },
  { name: 'Meja Favorit', col: 9, row: 7 },
  { name: 'Sudut Tenang', col: 11, row: 7 }, // area Arya duduk
];
