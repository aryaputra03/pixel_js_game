// ============================================
// maps.js — Tile Map Data
// Birthday Quest RPG
//
// Tahap 3: Tile map & collision detection
//
// Tile legend:
//   0 = jalan (walkable)
//   1 = tembok (solid)
//   2 = pintu / area khusus (walkable, bisa trigger event nanti)
//   3 = pintu terkunci (solid sampai player punya kunci)  ← BARU
//
// Ukuran peta: 15 kolom x 10 baris
// TILE_SIZE: 32px → total canvas 480x320 pas!
// ============================================

export const TILE_SIZE = 32;

// ============================================
// WARNA TILE — dipakai MapRenderer
// Nanti di Tahap 9 diganti spritesheet
// ============================================
export const TILE_COLORS = {
  0: '#2d4a3e', // jalan — hijau gelap
  1: '#1a1a2e', // tembok — navy hampir hitam
  2: '#3d5a4a', // pintu / transisi — sedikit lebih terang
  3: '#4a3000', // pintu terkunci — coklat gelap              ← BARU
  wall_top: '#252545', // tepi atas tembok (shading)
  wall_accent: '#16213e',
};

// ============================================
// MAP DATA
// Ukuran: 15 kolom × 10 baris = 480×320px
//
// Layout 3 ruangan:
//   [Ruang A] kiri  — "Ruang Santai"
//   [Ruang B] tengah atas — "Markas Rahasia"
//   [Ruang C] kanan bawah — "Pojok Cerita"
//   Koridor menghubungkan ketiganya
//
// Perubahan dari versi sebelumnya:
//   - Row 8, Col 13 diubah dari 0 → 3 (locked door)
//   - Pintu terkunci ini mengarah ke map berikutnya
// ============================================
export const MAP_DATA = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 0
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1], // row 1
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1], // row 2
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1], // row 3
  [1, 1, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1], // row 4
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1], // row 5
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // row 6
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // row 7
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1], // row 8 ← col 13 = locked door
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // row 9
];

// ============================================
// LOCKED DOOR POSITION
// Dipakai main.js & MapRenderer untuk logika & render
// ============================================
export const LOCKED_DOOR = { col: 13, row: 8 };

// ============================================
// ROOM LABELS — info nama ruangan
// ============================================
export const ROOM_LABELS = [
  { name: 'Kasir', col: 1, row: 1 },
  { name: 'Indoor', col: 6, row: 1 },
  { name: 'Indoor', col: 11, row: 1 },
  { name: 'Lorong', col: 1, row: 6 },
  { name: 'Aula', col: 7, row: 6 },
];

// ============================================
// POSISI SPAWN PLAYER
// ============================================
export const SPAWN = { col: 2, row: 2 };

// ============================================
// NPC DATA
// ============================================
export const NPCS = [
  {
    id: 'npc_01',
    col: 2,
    row: 1,
    dialogId: 'npc_ruang_santai',
    questTrigger: 'quest_01',
    label: 'Nabila',
    color: '#E8A838',
  },
  {
    id: 'npc_02',
    col: 7,
    row: 2,
    dialogId: 'npc_markas',
    questTrigger: 'quest_02',
    label: 'Yola',
    color: '#38C4E8',
  },
  {
    id: 'npc_03',
    col: 12,
    row: 2,
    dialogId: 'npc_pojok_cerita',
    questTrigger: 'quest_03',
    label: 'Siska',
    color: '#E838A0',
  },
];
