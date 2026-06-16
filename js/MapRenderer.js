// ============================================
// MapRenderer.js — Tile Map Rendering & Collision
// Birthday Quest RPG · Café Theme
//
// Perubahan dari versi sebelumnya:
//   - drawLockedDoor(): renderer untuk tile type 3
//   - isSolid(): tile 3 solid KECUALI jika hasKey = true
//   - lockedDoorUnlocked: runtime flag agar tile bisa jadi walkable
//     tanpa mutasi MAP_DATA (mutable global = rawan bug)
//   - renderLockedDoorPrompt(): prompt [E] Buka saat player dekat
//
// UPDATE — Pintu Terbuka:
//   - drawOpenDoor(): desain pintu terbuka (frame tetap ada, ada glow hijau)
//   - isNearOpenDoor(): proximity check pintu terbuka untuk trigger café
//   - renderOpenDoorPrompt(): prompt [E] Masuk Café
// ============================================

import { MAP_DATA, TILE_SIZE, ROOM_LABELS, LOCKED_DOOR } from '../data/maps.js';
import {
  drawRoomLabel,
  drawBadge,
  drawDoorPrompt,
  drawLabel,
} from './TextRenderer.js';
import GameState from './GameState.js';

// ============================================
// RUNTIME DOOR STATE
// ============================================

let _doorUnlocked = false;

export function unlockDoor() {
  _doorUnlocked = true;
  console.log('[MapRenderer] Locked door unlocked!');
}

export function isDoorUnlocked() {
  return _doorUnlocked;
}

// ============================================
// COLLISION
// ============================================

export function isSolid(gx, gy) {
  const tile = MAP_DATA[gy]?.[gx];
  if (tile === 3) return !_doorUnlocked;
  return tile === 1 || tile === undefined;
}

export function isSolidAtPixel(px, py) {
  return isSolid(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE));
}

// ============================================
// PROXIMITY CHECK — player dekat locked door (belum dibuka)
// ============================================

const DOOR_INTERACT_RADIUS = 40;

export function isNearLockedDoor(px, py) {
  if (_doorUnlocked) return false;

  const doorPx = LOCKED_DOOR.col * TILE_SIZE + TILE_SIZE / 2;
  const doorPy = LOCKED_DOOR.row * TILE_SIZE + TILE_SIZE / 2;
  const pcx = px + 14;
  const pcy = py + 14;

  const dx = doorPx - pcx;
  const dy = doorPy - pcy;
  return Math.sqrt(dx * dx + dy * dy) < DOOR_INTERACT_RADIUS;
}

// ============================================
// PROXIMITY CHECK — player dekat pintu TERBUKA (masuk café)  ← BARU
// ============================================

const OPEN_DOOR_RADIUS = 36;

/**
 * isNearOpenDoor(px, py)
 * Return true jika player dekat pintu yang sudah terbuka.
 * Dipakai main.js untuk tampilkan prompt "Masuk Café" & trigger transisi.
 */
export function isNearOpenDoor(px, py) {
  if (!_doorUnlocked) return false;

  const doorPx = LOCKED_DOOR.col * TILE_SIZE + TILE_SIZE / 2;
  const doorPy = LOCKED_DOOR.row * TILE_SIZE + TILE_SIZE / 2;
  const pcx = px + 14;
  const pcy = py + 14;

  const dx = doorPx - pcx;
  const dy = doorPy - pcy;
  return Math.sqrt(dx * dx + dy * dy) < OPEN_DOOR_RADIUS;
}

// ============================================
// PALETTE — Cozy Café Color System
// ============================================
const P = {
  floorBase: '#B5813F',
  floorDark: '#9A6A2E',
  floorLight: '#C8944E',
  floorGrain: '#A0712A',
  floorGrout: '#7A5520',
  floorShine: '#D4A85A',

  wallBase: '#D4BFA0',
  wallFace: '#C8AF8C',
  wallTop: '#B89E78',
  wallTopLight: '#E8D4B0',
  wallShadow: '#A08860',
  wallDado: '#8B6840',
  wallDadoLine: '#6A4E28',
  wallWood: '#9E7A48',

  doorBase: '#B5813F',
  doorFloorGrain: '#9A6A2E',
  doorFrameOuter: '#6A4220',
  doorFrameInner: '#8A5C30',
  doorGlass: '#A8D4E8',
  doorGlassShine: '#C8ECFF',
  doorGlow: '#FFD080',
  doorHandle: '#D4A030',

  // ── Locked Door ──
  lockedDoorBase: '#2A1A00',
  lockedFrameOuter: '#3D1F00',
  lockedFrameInner: '#5A3010',
  lockedPlank: '#4A2A08',
  lockedPlankLine: '#3A1E04',
  lockedMetal: '#888888',
  lockedKeyhole: '#1A1A1A',
  lockedKeyholeRim: '#AAAAAA',
  lockedWarn: '#FF6600',

  // ── Open Door (menuju café) ──                          ← BARU
  openFrameOuter: '#3A2008',
  openFrameInner: '#6A4020',
  openFloor: '#B5813F',
  openAmbient: 'rgba(255,200,120,0.3)', // cahaya hangat dari café
  openGlow: 'rgba(100,220,100,0.15)', // glow hijau pintu terbuka

  windowLight: 'rgba(255,220,120,0.10)',
};

// ============================================
// TILE RENDERERS
// ============================================

function tileHash(col, row) {
  return ((col * 1619 + row * 31337) ^ (col * 3571)) & 0xffff;
}

function drawFloor(ctx, x, y, col, row) {
  const S = TILE_SIZE;
  const h = tileHash(col, row);

  const plankRow = Math.floor(row / 1);
  const isLightPlank = (plankRow + Math.floor(col / 2)) % 3 === 0;
  const isDarkPlank = (plankRow + Math.floor(col / 2)) % 3 === 2;

  ctx.fillStyle = isLightPlank
    ? P.floorLight
    : isDarkPlank
      ? P.floorDark
      : P.floorBase;
  ctx.fillRect(x, y, S, S);

  ctx.fillStyle = P.floorGrain;
  const grainY1 = y + 7 + (h % 5);
  const grainY2 = y + 18 + (h % 4);
  const grainY3 = y + 27 + (h % 3);
  ctx.fillRect(x + 2, grainY1, 16 + (h % 8), 1);
  ctx.fillRect(x + 4, grainY2, 10 + ((h >> 4) % 12), 1);
  if (row % 2 === 0) ctx.fillRect(x + 8, grainY3, 6 + (h % 6), 1);

  ctx.fillStyle = P.floorGrout;
  ctx.fillRect(x, y + S - 1, S, 1);

  const seamCol = row % 2 === 0 ? col % 2 === 0 : col % 2 === 1;
  if (seamCol) {
    ctx.fillStyle = P.floorGrout;
    ctx.fillRect(x + S - 1, y, 1, S - 1);
  }

  if ((col * 7 + row * 3) % 11 === 0) {
    ctx.fillStyle = P.windowLight;
    ctx.fillRect(x, y, S, S);
  }

  if (isLightPlank) {
    ctx.fillStyle = P.floorShine;
    ctx.fillRect(x + 1, y + 1, 3, 1);
  }
}

function drawWall(ctx, x, y, col, row) {
  const S = TILE_SIZE;

  ctx.fillStyle = P.wallFace;
  ctx.fillRect(x, y, S, S);

  const capH = 5;
  ctx.fillStyle = P.wallTop;
  ctx.fillRect(x, y, S, capH);
  ctx.fillStyle = P.wallTopLight;
  ctx.fillRect(x, y, S, 1);
  ctx.fillRect(x, y, 1, capH);

  ctx.fillStyle = P.wallShadow;
  ctx.fillRect(x + S - 2, y + capH, 2, S - capH);

  const dadoY = y + Math.floor(S * 0.55);
  const dadoH = S - Math.floor(S * 0.55);

  ctx.fillStyle = P.wallDado;
  ctx.fillRect(x, dadoY, S, dadoH);

  ctx.fillStyle = P.wallDadoLine;
  ctx.fillRect(x, dadoY, S, 2);
  ctx.fillStyle = P.wallWood;
  ctx.fillRect(x, dadoY + 1, S, 1);

  const panW = 10,
    panH = dadoH - 6;
  const panX = x + (S - panW) / 2;
  const panY = dadoY + 4;
  if (panH > 4) {
    ctx.fillStyle = P.wallDadoLine;
    ctx.fillRect(panX, panY, panW, panH);
    ctx.fillStyle = P.wallDado;
    ctx.fillRect(panX + 1, panY + 1, panW - 2, panH - 2);
    ctx.fillStyle = P.wallWood;
    ctx.fillRect(panX + 1, panY + 1, panW - 2, 1);
    ctx.fillRect(panX + 1, panY + 1, 1, panH - 2);
  }

  const h = tileHash(col, row);
  if (h % 3 === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x + (h % 24) + 2, y + capH + 2 + (h % 10), 1, 1);
    ctx.fillRect(x + ((h >> 3) % 22) + 2, y + capH + 8 + ((h >> 2) % 8), 1, 1);
  }

  ctx.fillStyle = 'rgba(255,200,100,0.04)';
  ctx.fillRect(x, y, S, S);
}

function drawDoor(ctx, x, y) {
  const S = TILE_SIZE;

  ctx.fillStyle = P.doorBase;
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = P.doorFloorGrain;
  ctx.fillRect(x + 3, y + 8, 20, 1);
  ctx.fillRect(x + 5, y + 16, 18, 1);
  ctx.fillRect(x + 2, y + 24, 14, 1);
  ctx.fillStyle = P.floorGrout;
  ctx.fillRect(x, y + S - 1, S, 1);

  const fw = 14,
    fh = 20;
  const fx = x + (S - fw) / 2;
  const fy = y + (S - fh) - 2;

  ctx.fillStyle = P.doorFrameOuter;
  ctx.fillRect(fx - 3, fy - 3, fw + 6, fh + 3);
  ctx.fillStyle = P.doorFrameInner;
  ctx.fillRect(fx - 1, fy - 1, fw + 2, fh + 1);

  ctx.fillStyle = P.doorGlass;
  ctx.fillRect(fx, fy, fw, fh);

  ctx.fillStyle = P.doorGlassShine;
  ctx.fillRect(fx + 2, fy + 2, 3, fh - 4);
  ctx.fillRect(fx + 2, fy + 2, fw - 4, 2);

  const gAlpha = ((Math.sin(Date.now() / 1200) + 1) / 2) * 0.15 + 0.2;
  ctx.fillStyle = `rgba(255,210,100,${gAlpha})`;
  ctx.fillRect(fx, fy, fw, fh);

  ctx.fillStyle = P.doorHandle;
  ctx.fillRect(fx + fw - 3, fy + Math.floor(fh / 2) - 1, 3, 3);
  ctx.fillStyle = '#FFE080';
  ctx.fillRect(fx + fw - 2, fy + Math.floor(fh / 2) - 1, 1, 1);

  ctx.fillStyle = P.wallWood;
  ctx.fillRect(fx - 3, fy - 3, fw + 6, 1);
  ctx.fillRect(fx - 3, fy - 3, 1, fh + 3);
}

// ── LOCKED DOOR (terkunci) ──
function drawLockedDoor(ctx, x, y) {
  const S = TILE_SIZE;

  // Jika sudah dibuka → render desain pintu terbuka
  if (_doorUnlocked) {
    drawOpenDoor(ctx, x, y);
    return;
  }

  // ── Base gelap ──
  ctx.fillStyle = P.lockedDoorBase;
  ctx.fillRect(x, y, S, S);

  // ── Frame kayu tebal ──
  ctx.fillStyle = P.lockedFrameOuter;
  ctx.fillRect(x, y, S, 3);
  ctx.fillRect(x, y + S - 3, S, 3);
  ctx.fillRect(x, y, 3, S);
  ctx.fillRect(x + S - 3, y, 3, S);

  ctx.fillStyle = P.lockedFrameInner;
  ctx.fillRect(x + 1, y + 1, S - 2, 1);
  ctx.fillRect(x + 1, y + S - 2, S - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, S - 2);
  ctx.fillRect(x + S - 2, y + 1, 1, S - 2);

  // ── Papan kayu horizontal ──
  const innerX = x + 3;
  const innerW = S - 6;
  const plankHeights = [7, 7, 7, 7];
  let py = y + 3;
  for (let i = 0; i < plankHeights.length; i++) {
    ctx.fillStyle = i % 2 === 0 ? P.lockedPlank : '#402208';
    ctx.fillRect(innerX, py, innerW, plankHeights[i]);
    ctx.fillStyle = P.lockedPlankLine;
    ctx.fillRect(innerX, py + plankHeights[i] - 1, innerW, 1);
    py += plankHeights[i];
  }

  // ── Gembok ──
  const lockW = 10,
    lockH = 8;
  const lockX = x + (S - lockW) / 2;
  const lockY = y + (S - lockH) / 2 - 2;

  ctx.fillStyle = P.lockedMetal;
  ctx.fillRect(lockX, lockY, lockW, lockH);
  ctx.fillRect(lockX + 2, lockY - 5, 2, 5);
  ctx.fillRect(lockX + lockW - 4, lockY - 5, 2, 5);
  ctx.fillRect(lockX + 2, lockY - 5, lockW - 4, 2);

  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(lockX + 1, lockY + 1, lockW - 2, 1);
  ctx.fillRect(lockX + 1, lockY + 1, 1, lockH - 2);

  ctx.fillStyle = '#555555';
  ctx.fillRect(lockX + lockW - 1, lockY, 1, lockH);
  ctx.fillRect(lockX, lockY + lockH - 1, lockW, 1);

  // ── Keyhole ──
  const khX = lockX + lockW / 2 - 1;
  const khY = lockY + 2;
  ctx.fillStyle = P.lockedKeyhole;
  ctx.fillRect(khX, khY, 2, 3);
  ctx.fillRect(khX - 1, khY + 1, 4, 2);

  ctx.fillStyle = P.lockedKeyholeRim;
  ctx.fillRect(khX - 1, khY - 1, 4, 1);

  // ── Glow merah berkedip ──
  const glowAlpha = ((Math.sin(Date.now() / 800) + 1) / 2) * 0.2 + 0.1;
  ctx.fillStyle = `rgba(255, 80, 0, ${glowAlpha})`;
  ctx.fillRect(x, y, S, S);

  ctx.fillStyle = 'rgba(255, 200, 50, 0.6)';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🔒', x + S / 2, y + S - 4);
}

// ── OPEN DOOR (terbuka, menuju café) ──                   ← BARU
/**
 * drawOpenDoor(ctx, x, y)
 *
 * Render pintu yang sudah TERBUKA — menuju café.
 * Visualnya: pintu kayu terbuka ke samping, memperlihatkan
 * cahaya hangat dari dalam café, dengan frame pintu tetap ada.
 *
 * Design:
 * - Lantai tetap (player bisa jalan)
 * - Bingkai pintu (frame) di kiri-kanan-atas
 * - Daun pintu terbuka (rotated ke kanan, perspektif 2D)
 * - Cahaya kuning hangat dari dalam (glow berkedip)
 * - Efek depth — sedikit gelap di bagian dalam
 */
function drawOpenDoor(ctx, x, y) {
  const S = TILE_SIZE;
  const t = Date.now() / 1000;

  // ── Lantai (player bisa lewat) ──
  drawFloor(ctx, x, y, LOCKED_DOOR.col, LOCKED_DOOR.row);

  // ── Cahaya ambient dari dalam café ──
  // Lebar cahaya melebar ke arah player (bawah)
  const lightAlpha = ((Math.sin(t * 1.5) + 1) / 2) * 0.12 + 0.18;
  ctx.fillStyle = `rgba(255, 210, 120, ${lightAlpha})`;
  ctx.fillRect(x, y, S, S);

  // ── Frame pintu — tetap ada sebagai bingkai ──
  // Bagian atas
  ctx.fillStyle = P.openFrameOuter;
  ctx.fillRect(x, y, S, 4);
  ctx.fillStyle = P.openFrameInner;
  ctx.fillRect(x + 1, y + 1, S - 2, 2);
  // Highlight atas
  ctx.fillStyle = '#8B6030';
  ctx.fillRect(x + 1, y + 1, S - 2, 1);

  // Tiang kiri
  ctx.fillStyle = P.openFrameOuter;
  ctx.fillRect(x, y, 3, S);
  ctx.fillStyle = '#6A4020';
  ctx.fillRect(x + 1, y + 4, 1, S - 4);
  // Tiang kanan (hanya segmen atas — daun pintu menutup sisi kanan)
  ctx.fillStyle = P.openFrameOuter;
  ctx.fillRect(x + S - 3, y, 3, S);
  ctx.fillStyle = '#6A4020';
  ctx.fillRect(x + S - 2, y + 4, 1, S - 4);

  // ── Daun pintu terbuka (tampak samping — perspektif 2D) ──
  // Pintu dibuka ke KANAN (menempel ke tiang kanan dalam perspektif)
  // Tampak seperti pintu yang terbuka 90 derajat dari sudut top-down
  const doorW = 4; // lebar pintu jika dilihat dari samping
  const doorH = S - 6;
  const doorX = x + S - 3 - doorW;
  const doorY = y + 3;

  // Papan pintu dari samping
  ctx.fillStyle = '#4A2A08';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Highlight sisi
  ctx.fillStyle = '#6A4010';
  ctx.fillRect(doorX, doorY, 1, doorH);
  // Shadow sisi
  ctx.fillStyle = '#2A1000';
  ctx.fillRect(doorX + doorW - 1, doorY, 1, doorH);

  // Engsel pintu (kecil, detail)
  ctx.fillStyle = '#909090';
  ctx.fillRect(doorX - 1, doorY + 4, 2, 3);
  ctx.fillRect(doorX - 1, doorY + doorH - 7, 2, 3);

  // ── Depth shadow — area gelap di sisi kiri pintu (dalam) ──
  // Menunjukkan "kedalaman" pintu masuk
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x + 3, y + 4, 6, S - 8);

  // ── Label "CAFÉ" kecil — petunjuk visual ──
  ctx.fillStyle = 'rgba(255, 230, 160, 0.85)';
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('☕ CAFÉ', x + S / 2, y + 6);

  // ── Tanda panah masuk ──
  const arrAlpha = ((Math.sin(t * 2) + 1) / 2) * 0.4 + 0.5;
  ctx.fillStyle = `rgba(255, 230, 100, ${arrAlpha})`;
  ctx.font = '8px monospace';
  ctx.fillText('→', x + S / 2, y + S - 4);
}

// ============================================
// LOCKED DOOR PROMPT (belum dibuka)
// ============================================

export function renderLockedDoorPrompt(ctx, hasKey) {
  if (_doorUnlocked) return;

  const S = TILE_SIZE;
  const doorX = LOCKED_DOOR.col * S;
  const doorY = LOCKED_DOOR.row * S;

  const isMobile = 'ontouchstart' in window;
  const text = hasKey
    ? `${isMobile ? '[TAP]' : '[E]'} Buka Pintu`
    : '🔒 Butuh Kunci...';

  const bounce = Math.sin(Date.now() / 400) * 2;
  const cx = doorX + S / 2;
  const cy = doorY - 10 + bounce;
  const pWidth = ctx.measureText(text).width + 12;

  ctx.fillStyle = hasKey ? 'rgba(0, 180, 0, 0.85)' : 'rgba(180, 50, 0, 0.85)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

// ============================================
// OPEN DOOR PROMPT (pintu sudah terbuka)      ← BARU
// ============================================

/**
 * renderOpenDoorPrompt(ctx)
 * Tampilkan prompt [E] Masuk Café saat player dekat pintu terbuka.
 */
export function renderOpenDoorPrompt(ctx) {
  if (!_doorUnlocked) return;

  const S = TILE_SIZE;
  const doorX = LOCKED_DOOR.col * S;
  const doorY = LOCKED_DOOR.row * S;

  const isMobile = 'ontouchstart' in window;
  const text = `${isMobile ? '[TAP]' : '[E]'} Masuk Café ☕`;

  const bounce = Math.sin(Date.now() / 400) * 2;
  const cx = doorX + S / 2;
  const cy = doorY - 10 + bounce;
  const pWidth = ctx.measureText(text).width + 14;

  // Background pill — warna hangat cokelat
  ctx.fillStyle = 'rgba(120, 60, 0, 0.90)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255,210,100,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.stroke();

  ctx.fillStyle = '#FFE090';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

// ============================================
// MAIN RENDER
// ============================================

export function renderMap(ctx) {
  ctx.imageSmoothingEnabled = false;

  const rows = MAP_DATA.length;
  const cols = MAP_DATA[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = MAP_DATA[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile === 1) drawWall(ctx, x, y, col, row);
      else if (tile === 0) drawFloor(ctx, x, y, col, row);
      else if (tile === 2) drawDoor(ctx, x, y);
      else if (tile === 3) drawLockedDoor(ctx, x, y);
    }
  }

  // Global warm ambient overlay
  ctx.fillStyle = 'rgba(255,180,80,0.04)';
  ctx.fillRect(0, 0, cols * TILE_SIZE, rows * TILE_SIZE);
}

// ============================================
// ROOM LABELS
// ============================================

export function renderRoomLabels(ctx) {
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';

  for (const room of ROOM_LABELS) {
    const x = room.col * TILE_SIZE + 4;
    const y = room.row * TILE_SIZE + 12;

    ctx.fillStyle = 'rgba(60,30,10,0.7)';
    ctx.fillText(room.name, x + 1, y + 1);
    ctx.fillStyle = 'rgba(255,220,140,0.8)';
    ctx.fillText(room.name, x, y);
  }
}
