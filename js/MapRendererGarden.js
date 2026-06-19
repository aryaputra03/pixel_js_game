// ============================================
// MapRendererGarden.js — Taman Bunga Renderer
// Birthday Quest RPG · Map 3
//
// Perubahan dari versi sebelumnya:
//   - gardenNpcList: konversi GARDEN_NPCS grid→pixel
//   - getNearbyNPCGarden(px, py): proximity detection NPC taman
//   - renderGardenNPCs(ctx, nearbyNPC): render kucing + hamster
//   - renderGardenNPCPrompt(ctx, npc, bounce): prompt interaksi
//   - gardenNpcInteracted: Set tracking NPC yang sudah disapa
//   - markGardenNPCInteracted(id): tandai NPC sudah disapa
//   - isGardenNPCInteracted(id): cek status interaksi
// ============================================

import {
  GARDEN_MAP_DATA,
  TILE_SIZE_GARDEN,
  GARDEN_EXIT_DOOR,
  GARDEN_ROOM_LABELS,
  GARDEN_NPCS, // ← BARU
} from './maps_garden.js';
import { drawAnimalNPC } from './SpriteManager.js'; // ← BARU

// ============================================
// COLLISION
// ============================================

export function isSolidGarden(gx, gy) {
  const tile = GARDEN_MAP_DATA[gy]?.[gx];
  if (tile === 0 || tile === 2 || tile === 3) return false;
  return true;
}

export function isSolidGardenAtPixel(px, py) {
  return isSolidGarden(
    Math.floor(px / TILE_SIZE_GARDEN),
    Math.floor(py / TILE_SIZE_GARDEN)
  );
}

// ============================================
// PROXIMITY — pintu keluar
// ============================================

export function isNearGardenExit(px, py) {
  const doorPx = GARDEN_EXIT_DOOR.col * TILE_SIZE_GARDEN + TILE_SIZE_GARDEN / 2;
  const doorPy = GARDEN_EXIT_DOOR.row * TILE_SIZE_GARDEN + TILE_SIZE_GARDEN / 2;
  const cx = px + 12,
    cy = py + 14;
  const dx = doorPx - cx,
    dy = doorPy - cy;
  return Math.sqrt(dx * dx + dy * dy) < 52;
}

// ============================================
// NPC GARDEN — SETUP                                     ← BARU
//
// Konversi posisi grid → pixel, satu kali saat modul di-load.
// Offset NPC_SIZE agar NPC center di tengah tile.
// ============================================

const NPC_SIZE_GARDEN = 24; // lebar sprite hewan
const GARDEN_NPC_OFFSET = (TILE_SIZE_GARDEN - NPC_SIZE_GARDEN) / 2; // = 4

export const gardenNpcList = GARDEN_NPCS.map((npc) => ({
  ...npc,
  x: npc.col * TILE_SIZE_GARDEN + GARDEN_NPC_OFFSET,
  y: npc.row * TILE_SIZE_GARDEN + GARDEN_NPC_OFFSET,
  width: NPC_SIZE_GARDEN,
  height: NPC_SIZE_GARDEN,
}));

// ============================================
// NPC INTERACTION TRACKING                               ← BARU
// ============================================

const _gardenNpcInteracted = new Set();

/**
 * markGardenNPCInteracted(npcId)
 * Tandai NPC hewan taman sudah disapa.
 * Dipanggil dari main.js via _onDialogClose hook.
 */
export function markGardenNPCInteracted(npcId) {
  _gardenNpcInteracted.add(npcId);
  console.log(`[GardenNPC] Interacted: ${npcId}`);
}

/**
 * isGardenNPCInteracted(npcId)
 * Return true jika NPC sudah pernah disapa.
 */
export function isGardenNPCInteracted(npcId) {
  return _gardenNpcInteracted.has(npcId);
}

// ============================================
// PROXIMITY DETECTION — NPC TAMAN            ← BARU
// ============================================

const GARDEN_INTERACT_RADIUS = 44; // px — sedikit lebih kecil dari NPC manusia

/**
 * getNearbyNPCGarden(px, py)
 * Return NPC hewan pertama yang berada dalam radius dari player.
 *
 * @param {number} px - player x pixel
 * @param {number} py - player y pixel
 * @returns {Object|null}
 */
export function getNearbyNPCGarden(px, py) {
  const pcx = px + 12; // player center x (width 24 / 2)
  const pcy = py + 14; // player center y

  return (
    gardenNpcList.find((npc) => {
      const ncx = npc.x + NPC_SIZE_GARDEN / 2;
      const ncy = npc.y + NPC_SIZE_GARDEN / 2;
      const dx = ncx - pcx;
      const dy = ncy - pcy;
      return Math.sqrt(dx * dx + dy * dy) < GARDEN_INTERACT_RADIUS;
    }) ?? null
  );
}

// ============================================
// RENDER NPC HEWAN                                       ← BARU
// ============================================

/**
 * renderGardenNPCs(ctx, nearbyNPC)
 * Render semua NPC hewan di taman.
 * Gunakan drawAnimalNPC dari SpriteManager.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object|null} nearbyNPC - NPC yang sedang dekat player
 */
export function renderGardenNPCs(ctx, nearbyNPC) {
  for (const npc of gardenNpcList) {
    const isNearby = nearbyNPC?.id === npc.id;
    const isInteracted = isGardenNPCInteracted(npc.id);

    // Gambar sprite hewan
    ctx.save();
    if (isInteracted) {
      ctx.globalAlpha = 0.85; // sedikit redup setelah disapa
    }
    drawAnimalNPC(ctx, npc.x, npc.y, npc.type, isNearby);
    ctx.restore();

    // Prompt interaksi saat dekat
    if (isNearby) {
      const bounce = Math.sin(Date.now() / 280) * 2.5;
      renderGardenNPCPrompt(ctx, npc, bounce);
    }

    // Label nama di bawah sprite
    const cx = npc.x + NPC_SIZE_GARDEN / 2;
    const ny = npc.y + NPC_SIZE_GARDEN + 6;
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    // Shadow teks agar terbaca di atas rumput
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillText(npc.label, cx + 1, ny + 1);
    ctx.fillStyle = isInteracted ? '#AAFF88' : '#FFFFC0';
    ctx.fillText(npc.label, cx, ny);

    // Tanda hati kecil setelah disapa — menggantikan centang biasa
    // karena ini hewan, pakai ❤ lebih cocok
    if (isInteracted) {
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF6688';
      ctx.fillText('♥', npc.x + NPC_SIZE_GARDEN / 2, npc.y - 2);
    }
  }
}

/**
 * renderGardenNPCPrompt(ctx, npc, bounce)
 * Tampilkan prompt interaksi di atas NPC hewan.
 * Teks disesuaikan dengan jenis hewan.
 */
function renderGardenNPCPrompt(ctx, npc, bounce) {
  const isMobile = 'ontouchstart' in window;
  const key = isMobile ? '[ E ]' : '[ E ]';

  // Teks aksi berbeda per hewan
  let action = 'Sapa';
  if (npc.type === 'cat') action = 'Elus';
  if (npc.type === 'hamster') action = 'Peluk';

  const text = `${key} ${action}`;
  const cx = npc.x + npc.width / 2;
  const cy = npc.y - 12 + bounce;
  const pWidth = ctx.measureText(text).width + 12;

  // Background pill — warna berbeda per hewan
  const bgColor =
    npc.type === 'cat'
      ? 'rgba(80,40,120,0.80)' // ungu untuk kucing
      : 'rgba(180,80,40,0.80)'; // oranye untuk hamster

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 9, pWidth, 16, 5);
  ctx.fill();

  // Border tipis
  ctx.strokeStyle =
    npc.type === 'cat' ? 'rgba(200,150,255,0.6)' : 'rgba(255,180,100,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 3);
}

// ============================================
// PALETTE TAMAN
// ============================================

const G = {
  grassBase: '#4A7C42',
  grassDark: '#3D6836',
  grassLight: '#5A9050',
  grassDetail: '#3A5E34',
  pathBase: '#B8A882',
  pathDark: '#9E8E6C',
  pathLight: '#CCBC98',
  pathEdge: '#8A7A5C',
  fenceBase: '#7A5230',
  fenceTop: '#9A6A40',
  fenceDark: '#5A3A1E',
  red1: '#E83030',
  red2: '#FF5050',
  redStem: '#2A5020',
  yel1: '#F0C020',
  yel2: '#FFD840',
  yelStem: '#2A5020',
  pur1: '#9040C0',
  pur2: '#B060E0',
  purStem: '#2A5020',
  whi1: '#E8E8F0',
  whi2: '#FFFFFF',
  whiStem: '#2A5020',
  leafDark: '#2A5020',
  leafMid: '#3A7030',
  leafLight: '#4A8840',
  trunkBase: '#6A4020',
  waterDeep: '#1A4878',
  waterMid: '#2A5A90',
  waterLight: '#3A78B8',
  waterShine: 'rgba(200,230,255,0.4)',
  pondEdge: '#3A6838',
};

// ============================================
// TILE RENDERERS (tidak berubah)
// ============================================

function drawGrass(ctx, x, y, col, row) {
  const S = TILE_SIZE_GARDEN;
  ctx.fillStyle = (col + row) % 2 === 0 ? G.grassBase : G.grassDark;
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = G.grassLight;
  ctx.fillRect(x, y, S, 1);
  ctx.fillRect(x, y, 1, S);
  ctx.fillStyle = G.grassDetail;
  if ((col * 3 + row * 5) % 7 === 0) {
    ctx.fillRect(x + 5, y + 8, 1, 4);
    ctx.fillRect(x + 7, y + 6, 1, 5);
    ctx.fillRect(x + 9, y + 9, 1, 3);
  }
  if ((col * 7 + row * 3) % 9 === 0) {
    ctx.fillRect(x + 18, y + 12, 1, 4);
    ctx.fillRect(x + 22, y + 10, 1, 6);
  }
  if ((col * 5 + row * 11) % 11 === 0) {
    ctx.fillRect(x + 12, y + 20, 1, 5);
    ctx.fillRect(x + 25, y + 22, 1, 4);
  }
}

function drawPath(ctx, x, y, col, row) {
  const S = TILE_SIZE_GARDEN;
  ctx.fillStyle = G.pathBase;
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = G.pathEdge;
  ctx.fillRect(x, y, S, 1);
  ctx.fillRect(x, y + S - 1, S, 1);
  ctx.fillRect(x, y, 1, S);
  ctx.fillRect(x + S - 1, y, 1, S);
  ctx.fillStyle = G.pathLight;
  ctx.fillRect(x + 1, y + 1, S - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, S - 2);
  ctx.fillStyle = G.pathDark;
  if ((col + row) % 2 === 0) {
    ctx.fillRect(x + 8, y + 6, 14, 8);
    ctx.fillRect(x + 4, y + 18, 10, 8);
    ctx.fillRect(x + 18, y + 18, 8, 8);
  } else {
    ctx.fillRect(x + 4, y + 8, 10, 10);
    ctx.fillRect(x + 18, y + 6, 8, 8);
    ctx.fillRect(x + 10, y + 20, 14, 6);
  }
}

function drawFence(ctx, x, y) {
  const S = TILE_SIZE_GARDEN;
  ctx.fillStyle = G.fenceDark;
  ctx.fillRect(x, y, S, S);
  const plankW = 6,
    gap = 4;
  for (let bx = 2; bx < S - 2; bx += plankW + gap) {
    ctx.fillStyle = G.fenceBase;
    ctx.fillRect(x + bx, y + 2, plankW, S - 4);
    ctx.fillStyle = G.fenceTop;
    ctx.fillRect(x + bx, y + 2, plankW, 2);
    ctx.fillRect(x + bx, y + 2, 1, S - 4);
    ctx.fillStyle = G.fenceBase;
    ctx.fillRect(x + bx + 1, y, plankW - 2, 3);
    ctx.fillRect(x + bx + 2, y - 1, plankW - 4, 2);
  }
  ctx.fillStyle = G.fenceBase;
  ctx.fillRect(x, y + S * 0.4, S, 3);
  ctx.fillRect(x, y + S * 0.65, S, 3);
  ctx.fillStyle = G.fenceTop;
  ctx.fillRect(x, y + S * 0.4, S, 1);
  ctx.fillRect(x, y + S * 0.65, S, 1);
}

function drawFlower(ctx, x, y, col1, col2, stemCol) {
  const S = TILE_SIZE_GARDEN;
  drawGrass(ctx, x, y, 0, 0);
  ctx.fillStyle = stemCol;
  ctx.fillRect(x + 14, y + 14, 4, 14);
  ctx.fillRect(x + 10, y + 20, 4, 3);
  ctx.fillRect(x + 18, y + 18, 4, 3);
  ctx.fillStyle = col1;
  ctx.fillRect(x + 12, y + 4, 8, 6);
  ctx.fillRect(x + 12, y + 16, 8, 6);
  ctx.fillRect(x + 4, y + 8, 6, 8);
  ctx.fillRect(x + 22, y + 8, 6, 8);
  ctx.fillRect(x + 6, y + 4, 5, 5);
  ctx.fillRect(x + 21, y + 4, 5, 5);
  ctx.fillRect(x + 6, y + 19, 5, 5);
  ctx.fillRect(x + 21, y + 19, 5, 5);
  ctx.fillStyle = col2;
  ctx.fillRect(x + 13, y + 5, 3, 2);
  ctx.fillRect(x + 5, y + 9, 2, 3);
  ctx.fillStyle = '#F0D020';
  ctx.fillRect(x + 11, y + 8, 10, 10);
  ctx.fillStyle = '#FFE840';
  ctx.fillRect(x + 12, y + 9, 8, 8);
  ctx.fillStyle = '#C09010';
  ctx.fillRect(x + 13, y + 10, 2, 2);
  ctx.fillRect(x + 17, y + 10, 2, 2);
  ctx.fillRect(x + 13, y + 14, 2, 2);
  ctx.fillRect(x + 17, y + 14, 2, 2);
}

function drawTree(ctx, x, y) {
  const S = TILE_SIZE_GARDEN;
  drawGrass(ctx, x, y, 0, 0);
  ctx.fillStyle = G.trunkBase;
  ctx.fillRect(x + 12, y + 18, 8, 12);
  ctx.fillStyle = '#8A5228';
  ctx.fillRect(x + 12, y + 18, 2, 12);
  ctx.fillStyle = G.leafDark;
  ctx.fillRect(x + 6, y + 4, 20, 16);
  ctx.fillRect(x + 4, y + 8, 24, 12);
  ctx.fillStyle = G.leafMid;
  ctx.fillRect(x + 8, y + 2, 16, 16);
  ctx.fillRect(x + 6, y + 6, 20, 14);
  ctx.fillStyle = G.leafLight;
  ctx.fillRect(x + 10, y + 2, 12, 8);
  ctx.fillRect(x + 8, y + 4, 6, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x + 10, y + 3, 6, 3);
}

function drawPond(ctx, x, y) {
  const S = TILE_SIZE_GARDEN;
  drawGrass(ctx, x, y, 0, 0);
  ctx.fillStyle = G.pondEdge;
  ctx.fillRect(x + 2, y + 4, S - 4, S - 8);
  ctx.fillRect(x + 4, y + 2, S - 8, S - 4);
  ctx.fillStyle = G.waterDeep;
  ctx.fillRect(x + 4, y + 6, S - 8, S - 12);
  ctx.fillRect(x + 6, y + 4, S - 12, S - 8);
  ctx.fillStyle = G.waterMid;
  ctx.fillRect(x + 6, y + 7, S - 12, S - 14);
  const t = Date.now() / 1000;
  ctx.fillStyle = G.waterLight;
  ctx.fillRect(x + 8 + Math.sin(t * 1.5) * 2, y + 10, 6, 2);
  ctx.fillRect(x + 18 + Math.sin(t * 1.2 + 1) * 2, y + 16, 4, 2);
  ctx.fillStyle = G.waterShine;
  ctx.fillRect(x + 7, y + 6, 8, 3);
  ctx.fillStyle = '#3A7830';
  ctx.fillRect(x + 22, y + 14, 3, 6);
  ctx.fillRect(x + 20, y + 10, 5, 5);
}

function drawDoor(ctx, x, y) {
  const S = TILE_SIZE_GARDEN;
  drawPath(ctx, x, y, 0, 0);
  const fw = 12,
    fh = 20;
  const fx = x + (S - fw) / 2,
    fy = y + (S - fh) - 2;
  ctx.fillStyle = '#5A3A20';
  ctx.fillRect(fx - 2, fy - 2, fw + 4, fh + 2);
  ctx.fillStyle = '#7A5230';
  ctx.fillRect(fx, fy, fw, fh);
  const alpha = ((Math.sin(Date.now() / 700) + 1) / 2) * 0.25 + 0.1;
  ctx.fillStyle = `rgba(60,160,60,${alpha})`;
  ctx.fillRect(fx + 1, fy + 1, fw - 2, fh - 2);
  ctx.fillStyle = '#4A9A40';
  ctx.fillRect(fx - 2, fy - 2, fw + 4, 1);
  ctx.fillRect(fx - 2, fy - 2, 1, fh + 2);
  ctx.fillRect(fx + fw + 1, fy - 2, 1, fh + 2);
}

// ============================================
// MAIN RENDER
// ============================================

export function renderGardenMap(ctx) {
  ctx.imageSmoothingEnabled = false;
  const rows = GARDEN_MAP_DATA.length;
  const cols = GARDEN_MAP_DATA[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = GARDEN_MAP_DATA[row][col];
      const x = col * TILE_SIZE_GARDEN;
      const y = row * TILE_SIZE_GARDEN;

      switch (tile) {
        case 0:
          drawGrass(ctx, x, y, col, row);
          break;
        case 1:
          drawFence(ctx, x, y);
          break;
        case 2:
          drawDoor(ctx, x, y);
          break;
        case 3:
          drawPath(ctx, x, y, col, row);
          break;
        case 4:
          drawFlower(ctx, x, y, G.red1, G.red2, G.redStem);
          break;
        case 5:
          drawFlower(ctx, x, y, G.yel1, G.yel2, G.yelStem);
          break;
        case 6:
          drawFlower(ctx, x, y, G.pur1, G.pur2, G.purStem);
          break;
        case 7:
          drawFlower(ctx, x, y, G.whi1, G.whi2, G.whiStem);
          break;
        case 8:
          drawTree(ctx, x, y);
          break;
        case 9:
          drawPond(ctx, x, y);
          break;
      }
    }
  }

  // Overlay angin sepoi lembut
  ctx.fillStyle = 'rgba(180,240,160,0.025)';
  ctx.fillRect(0, 0, cols * TILE_SIZE_GARDEN, rows * TILE_SIZE_GARDEN);
}

// ============================================
// ROOM LABELS
// ============================================

export function renderGardenRoomLabels(ctx) {
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';
  for (const room of GARDEN_ROOM_LABELS) {
    const x = room.col * TILE_SIZE_GARDEN + 4;
    const y = room.row * TILE_SIZE_GARDEN + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(room.name, x + 1, y + 1);
    ctx.fillStyle = 'rgba(200,255,200,0.8)';
    ctx.fillText(room.name, x, y);
  }
}

// ============================================
// PROMPT KELUAR
// ============================================

export function renderGardenExitPrompt(ctx) {
  const isMobile = 'ontouchstart' in window;
  const text = isMobile ? '[ E ] Kembali ke Café' : '[ E ] Kembali ke Café';
  const cx = 80,
    cy = 160 + Math.sin(Date.now() / 400) * 3;
  const pw = ctx.measureText(text).width + 14;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, cy - 9, pw, 16, 4);
  ctx.fill();
  ctx.fillStyle = '#ccffcc';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 4);
}
