// ============================================
// MapRendererCafe.js — Café Interior Renderer
// Birthday Quest RPG · Map 2
//
// Perubahan dari versi sebelumnya:
//   - Tile 3: drawCafeLockedDoor() — pintu terkunci pojok kanan bawah
//   - _cafeDoorUnlocked: runtime flag, tidak mutasi MAP_DATA
//   - isSolidCafe(): tile 3 solid kecuali sudah unlock
//   - isNearCafeLockedDoor(): proximity check pintu terkunci
//   - isNearCafeOpenDoor(): proximity check pintu terbuka (ke map 3)
//   - unlockCafeDoor(): dipanggil main.js saat kondisi terpenuhi
//   - isCafeDoorUnlocked(): getter untuk main.js
//   - renderCafeLockedDoorPrompt(): overlay prompt saat dekat pintu kunci
//   - renderCafeOpenDoorPrompt(): overlay prompt saat pintu sudah terbuka
//   - drawMaleNPC(): pixel art NPC laki-laki untuk Arya
//   - renderCafeNPCs(): render semua NPC di café + nama label
//   - getNearbyNPCCafe(): proximity detection NPC café
// ============================================

import {
  CAFE_MAP_DATA,
  TILE_SIZE_CAFE,
  CAFE_ROOM_LABELS,
  CAFE_EXIT_DOOR,
  CAFE_LOCKED_DOOR,
  CAFE_NPCS,
} from './maps_cafe.js';

// ============================================
// RUNTIME DOOR STATE — café locked door        ← BARU
// ============================================

let _cafeDoorUnlocked = false;

/** Buka pintu terkunci di café. Dipanggil main.js. */
export function unlockCafeDoor() {
  _cafeDoorUnlocked = true;
  console.log('[MapRendererCafe] Café locked door unlocked!');
}

/** Getter untuk main.js. */
export function isCafeDoorUnlocked() {
  return _cafeDoorUnlocked;
}

// ============================================
// NPC STATE — tracking interaksi             ← BARU
// ============================================

// Set id NPC café yang sudah diajak ngobrol sampai selesai
// Di-fill oleh main.js via markCafeNPCInteracted()
const _cafeNPCInteracted = new Set();

export function markCafeNPCInteracted(npcId) {
  _cafeNPCInteracted.add(npcId);
}

export function isCafeNPCInteracted(npcId) {
  return _cafeNPCInteracted.has(npcId);
}

/**
 * allCafeNPCsInteracted()
 * True jika semua NPC mustInteract di café sudah diajak ngobrol.
 */
export function allCafeNPCsInteracted() {
  return CAFE_NPCS.filter((n) => n.mustInteract).every((n) =>
    _cafeNPCInteracted.has(n.id)
  );
}

// ============================================
// NPC LIST — pixel posisi                     ← BARU
// ============================================

const NPC_SIZE_CAFE = 24;
const NPC_OFFSET = (TILE_SIZE_CAFE - NPC_SIZE_CAFE) / 2; // = 4px

export const cafeNpcList = CAFE_NPCS.map((npc) => ({
  ...npc,
  x: npc.col * TILE_SIZE_CAFE + NPC_OFFSET,
  y: npc.row * TILE_SIZE_CAFE + NPC_OFFSET,
  width: NPC_SIZE_CAFE,
  height: NPC_SIZE_CAFE,
}));

// ============================================
// PROXIMITY — NPC café                        ← BARU
// ============================================

const NPC_CAFE_RADIUS = 48;

export function getNearbyNPCCafe(px, py) {
  const pcx = px + 14;
  const pcy = py + 14;

  return (
    cafeNpcList.find((npc) => {
      const ncx = npc.x + NPC_SIZE_CAFE / 2;
      const ncy = npc.y + NPC_SIZE_CAFE / 2;
      const dx = ncx - pcx;
      const dy = ncy - pcy;
      return Math.sqrt(dx * dx + dy * dy) < NPC_CAFE_RADIUS;
    }) ?? null
  );
}

// ============================================
// COLLISION CAFÉ
// ============================================

export function isSolidCafe(gx, gy) {
  const tile = CAFE_MAP_DATA[gy]?.[gx];
  // Tile 3 = locked door: solid jika belum dibuka
  if (tile === 3) return !_cafeDoorUnlocked;
  // Walkable: 0, 2, 9
  if (tile === 0 || tile === 2 || tile === 9) return false;
  return true;
}

export function isSolidCafeAtPixel(px, py) {
  return isSolidCafe(
    Math.floor(px / TILE_SIZE_CAFE),
    Math.floor(py / TILE_SIZE_CAFE)
  );
}

// ============================================
// PROXIMITY — pintu café exit (ke map 1)
// ============================================
const EXIT_RADIUS = 40;

export function isNearCafeExit(px, py) {
  const doorPx = CAFE_EXIT_DOOR.col * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const doorPy = CAFE_EXIT_DOOR.row * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const pcx = px + 14;
  const pcy = py + 14;
  const dx = doorPx - pcx;
  const dy = doorPy - pcy;
  return Math.sqrt(dx * dx + dy * dy) < EXIT_RADIUS;
}

// ============================================
// PROXIMITY — pintu terkunci café             ← BARU
// ============================================
const CAFE_LOCK_RADIUS = 42;

export function isNearCafeLockedDoor(px, py) {
  if (_cafeDoorUnlocked) return false;
  const doorPx = CAFE_LOCKED_DOOR.col * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const doorPy = CAFE_LOCKED_DOOR.row * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const pcx = px + 14;
  const pcy = py + 14;
  const dx = doorPx - pcx;
  const dy = doorPy - pcy;
  return Math.sqrt(dx * dx + dy * dy) < CAFE_LOCK_RADIUS;
}

// ============================================
// PROXIMITY — pintu terbuka café              ← BARU
// ============================================
const CAFE_OPEN_RADIUS = 38;

export function isNearCafeOpenDoor(px, py) {
  if (!_cafeDoorUnlocked) return false;
  const doorPx = CAFE_LOCKED_DOOR.col * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const doorPy = CAFE_LOCKED_DOOR.row * TILE_SIZE_CAFE + TILE_SIZE_CAFE / 2;
  const pcx = px + 14;
  const pcy = py + 14;
  const dx = doorPx - pcx;
  const dy = doorPy - pcy;
  return Math.sqrt(dx * dx + dy * dy) < CAFE_OPEN_RADIUS;
}

// ============================================
// PALETTE CAFÉ — Cozy Warm Coffee Shop
// ============================================
const C = {
  floorWood: '#C4894A',
  floorWoodDk: '#A86E30',
  floorWoodLt: '#D4A064',
  floorGrn: '#8B5E1E',
  floorGrout: '#6A4010',

  carpetBase: '#8B3A3A',
  carpetDark: '#722828',
  carpetBorder: '#C06040',
  carpetPattern: '#A04030',

  wallBase: '#E8D4B8',
  wallPaper: '#D4C0A0',
  wallStripe: '#C0A880',
  wallDado: '#8B5E30',
  wallDadoLine: '#6A4010',
  wallTop: '#BCA888',
  wallMold: '#A09070',

  counterFace: '#5A3010',
  counterFaceHi: '#7A4820',
  counterTop: '#2A1500',
  counterTopHi: '#3D2208',
  counterSteel: '#C0C0C0',
  counterSteelDk: '#909090',
  counterTile: '#D8C8A0',

  machineBody: '#2A2A2A',
  machineAccent: '#C0A830',
  machineLcd: '#1A3A1A',
  machineLcdOn: '#40C040',
  machineGroup: '#3A3A3A',

  tableTop: '#8B5E30',
  tableTopHi: '#A87040',
  tableTopSh: '#6A4010',
  tableLeg: '#5A3A18',
  tableLegSh: '#3A2008',
  tableRing: '#C09050',

  chairSeat: '#7A3A20',
  chairSeatHi: '#9A5030',
  chairBack: '#7A3A20',
  chairLeg: '#4A2810',
  chairCushion: '#C87840',

  winFrame: '#4A2810',
  winGlass: '#A8D4E8',
  winGlassHi: '#C8ECFF',
  winSky: '#87CEEB',
  winCurtainA: '#C84040',
  winCurtainB: '#A02020',

  potBase: '#8B5E30',
  potHi: '#A07040',
  potSoil: '#3A2010',
  leafDark: '#1A4A10',
  leafMid: '#2A6A20',
  leafLight: '#40A030',
  leafHi: '#60C040',

  doorFrame: '#5A3010',
  doorGlass: '#A8D0E8',
  doorGlassHi: '#C8ECFF',
  doorHandle: '#C09030',

  // ── Locked door café ──
  lockedBase: '#1E1008',
  lockedFrame: '#3A1E00',
  lockedFrameIn: '#5A3010',
  lockedPlank: '#3A2008',
  lockedPlankLine: '#281404',
  lockedMetal: '#707070',
  lockedKeyhole: '#111111',
  lockedKeyholeRim: '#999999',
  lockedChain: '#888840',
  lockedChainDk: '#666620',
  lockedWarn: '#CC4400',

  lampLight: 'rgba(255,210,100,0.08)',
};

// ============================================
// TILE HASH
// ============================================
function tileHash(col, row) {
  return ((col * 1619 + row * 31337) ^ (col * 3571)) & 0xffff;
}

// ============================================
// TILE RENDERERS
// ============================================

function drawFloorWood(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;
  const h = tileHash(col, row);

  const plankGroup = Math.floor((col + row) / 2) % 3;
  const baseColor =
    plankGroup === 0
      ? C.floorWoodDk
      : plankGroup === 1
        ? C.floorWood
        : C.floorWoodLt;

  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, S, S);

  ctx.fillStyle = C.floorGrn;
  ctx.fillRect(x + 2, y + 6 + (h % 6), 18 + (h % 10), 1);
  ctx.fillRect(x + 4, y + 14 + (h % 5), 12 + ((h >> 3) % 14), 1);
  if ((col + row) % 2 === 0)
    ctx.fillRect(x + 8, y + 23 + (h % 4), 8 + (h % 8), 1);

  ctx.fillStyle = C.floorGrout;
  ctx.fillRect(x, y + S - 1, S, 1);
  if ((col % 2 === 0 && row % 2 === 0) || (col % 2 === 1 && row % 2 === 1)) {
    ctx.fillRect(x + S - 1, y, 1, S - 1);
  }

  if (plankGroup === 2) {
    ctx.fillStyle = 'rgba(255,220,150,0.12)';
    ctx.fillRect(x + 1, y + 1, 4, 1);
  }

  ctx.fillStyle = C.lampLight;
  ctx.fillRect(x, y, S, S);
}

function drawCarpet(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;

  ctx.fillStyle = C.carpetBase;
  ctx.fillRect(x, y, S, S);

  ctx.fillStyle = C.carpetPattern;
  for (let cy = 0; cy < S; cy += 8) {
    for (let cx2 = 0; cx2 < S; cx2 += 8) {
      const patH = tileHash(col * 32 + cx2, row * 32 + cy);
      if (patH % 5 === 0) ctx.fillRect(x + cx2 + 2, y + cy + 2, 4, 4);
      else if (patH % 7 === 0) ctx.fillRect(x + cx2 + 3, y + cy + 3, 2, 2);
    }
  }

  ctx.fillStyle = C.carpetBorder;
  ctx.fillRect(x, y, S, 1);
  ctx.fillRect(x, y + S - 1, S, 1);
  ctx.fillRect(x, y, 1, S);
  ctx.fillRect(x + S - 1, y, 1, S);

  if ((col + row) % 3 === 0) {
    ctx.fillStyle = 'rgba(255,200,160,0.06)';
    ctx.fillRect(x, y, S, S);
  }
}

function drawWallCafe(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;

  ctx.fillStyle = C.wallPaper;
  ctx.fillRect(x, y, S, S);

  for (let sx = 0; sx < S; sx += 6) {
    ctx.fillStyle = C.wallStripe;
    ctx.fillRect(x + sx, y, 1, S);
  }

  const moldH = 4;
  ctx.fillStyle = C.wallTop;
  ctx.fillRect(x, y, S, moldH);
  ctx.fillStyle = C.wallMold;
  ctx.fillRect(x, y, S, 1);
  ctx.fillStyle = '#D0BC94';
  ctx.fillRect(x, y + moldH, S, 1);

  const dadoY = y + Math.floor(S * 0.6);
  const dadoH = S - Math.floor(S * 0.6);
  ctx.fillStyle = C.wallDado;
  ctx.fillRect(x, dadoY, S, dadoH);
  ctx.fillStyle = C.wallDadoLine;
  ctx.fillRect(x, dadoY, S, 2);
  ctx.fillStyle = '#A87840';
  ctx.fillRect(x, dadoY + 1, S, 1);

  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(x + S - 2, y, 2, S);

  // ── Dekorasi ulang tahun di tembok atas ──
  drawBirthdayWallDecor(ctx, x, y, col, row, S);
}

/**
 * drawBirthdayWallDecor(ctx, x, y, col, row, S)
 * Garland bendera segitiga + balon menempel di tembok bagian atas (row 0).
 * Hanya digambar di tile tembok baris paling atas agar tidak berulang
 * di setiap baris tembok.
 */
function drawBirthdayWallDecor(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;
  if (row !== 0) return; // hanya di baris tembok paling atas

  // ── Garland segitiga (bunting flags) menggantung dari plafon ──
  const flagColors = ['#FF6B81', '#FFD166', '#6FCF97', '#56CCF2', '#BB6BD9'];
  const flagIdx = col % flagColors.length;
  const flagColor = flagColors[flagIdx];

  // Tali garland melintang
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 5);
  ctx.quadraticCurveTo(x + S / 2, y + 9, x + S, y + 5);
  ctx.stroke();

  // Bendera segitiga kecil menggantung
  const fx = x + S / 2 - 4;
  const fy = y + 7;
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx + 8, fy);
  ctx.lineTo(fx + 4, fy + 9);
  ctx.closePath();
  ctx.fill();

  // Aksen putih kecil di bendera
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(fx + 2, fy + 1, 4, 1);

  // ── Balon sesekali (tidak di setiap tile, biar tidak penuh) ──
  if ((col * 7 + 3) % 4 === 0) {
    drawWallBalloon(
      ctx,
      x + S / 2,
      y + S - 2,
      flagColors[(col + 2) % flagColors.length]
    );
  }
}

/**
 * drawWallBalloon(ctx, cx, by, color)
 * Balon kecil menempel di tembok, melayang pelan (animasi sin halus).
 */
function drawWallBalloon(ctx, cx, by, color) {
  const t = Date.now() / 1000;
  const floatY = Math.sin(t * 1.3 + cx * 0.1) * 2;
  const cy = by + floatY;

  // Tali balon
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 6);
  ctx.lineTo(cx, cy + 14);
  ctx.stroke();

  // Badan balon (oval)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight balon
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - 1.5, cy - 2, 1.6, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simpul kecil di bawah
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 1.5, cy + 5.5);
  ctx.lineTo(cx + 1.5, cy + 5.5);
  ctx.lineTo(cx, cy + 7.5);
  ctx.closePath();
  ctx.fill();
}

function drawWindow(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 3000;

  ctx.fillStyle = C.wallPaper;
  ctx.fillRect(x, y, S, S);

  const fw = S - 6,
    fh = S - 4;
  const fx = x + 3,
    fy = y + 2;

  ctx.fillStyle = C.winFrame;
  ctx.fillRect(fx - 2, fy - 2, fw + 4, fh + 4);

  ctx.fillStyle = C.winSky;
  ctx.fillRect(fx, fy, fw, fh);

  ctx.fillStyle = C.winGlass;
  ctx.fillRect(fx, fy, fw, Math.floor(fh * 0.6));

  ctx.fillStyle = C.winGlassHi;
  ctx.fillRect(fx + 2, fy + 2, 3, fh - 4);
  ctx.fillRect(fx + 2, fy + 2, fw - 4, 2);

  const lightAlpha = ((Math.sin(t) + 1) / 2) * 0.1 + 0.05;
  ctx.fillStyle = `rgba(255,235,180,${lightAlpha})`;
  ctx.fillRect(fx, fy, fw, fh);

  ctx.fillStyle = C.winCurtainA;
  ctx.fillRect(fx, fy, 4, fh);
  ctx.fillRect(fx + fw - 4, fy, 4, fh);
  ctx.fillStyle = C.winCurtainB;
  ctx.fillRect(fx + 3, fy, 1, fh);
  ctx.fillRect(fx + fw - 4, fy, 1, fh);

  ctx.fillStyle = '#8B6030';
  ctx.fillRect(fx - 2, fy - 1, fw + 4, 2);
  ctx.fillStyle = '#C09050';
  ctx.fillRect(fx - 2, fy - 1, fw + 4, 1);

  ctx.fillStyle = C.winFrame;
  ctx.fillRect(fx + Math.floor(fw / 2) - 1, fy, 2, fh);
  ctx.fillRect(fx, fy + Math.floor(fh / 2) - 1, fw, 2);
}

function drawCounter(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;

  ctx.fillStyle = C.counterTile;
  ctx.fillRect(x, y, S, S);

  ctx.fillStyle = '#C0B090';
  for (let ty = 0; ty < S; ty += 8) ctx.fillRect(x, y + ty, S, 1);
  for (let tx = 0; tx < S; tx += 8) ctx.fillRect(x + tx, y, 1, S);

  const counterFaceY = y + Math.floor(S * 0.4);
  const counterFaceH = S - Math.floor(S * 0.4);
  ctx.fillStyle = C.counterFace;
  ctx.fillRect(x, counterFaceY, S, counterFaceH);

  ctx.fillStyle = C.counterFaceHi;
  ctx.fillRect(x, counterFaceY, S, 3);

  ctx.fillStyle = C.counterTop;
  ctx.fillRect(x, counterFaceY - 4, S, 4);
  ctx.fillStyle = C.counterTopHi;
  ctx.fillRect(x, counterFaceY - 4, S, 1);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x + 4, counterFaceY - 3, S - 8, 1);

  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x + 4, counterFaceY + 4, 8, counterFaceH - 8);
  ctx.fillRect(x + 18, counterFaceY + 4, 8, counterFaceH - 8);

  ctx.fillStyle = C.counterSteel;
  ctx.fillRect(x, counterFaceY - 2, S, 2);
  ctx.fillStyle = C.counterSteelDk;
  ctx.fillRect(x, counterFaceY - 1, S, 1);
}

function drawTable(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;
  const h = tileHash(col, row);

  drawCarpet(ctx, x, y, col, row);

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 4, y + 20, S - 6, 10);

  ctx.fillStyle = C.tableLegSh;
  ctx.fillRect(x + 8, y + 12, 3, 14);
  ctx.fillRect(x + S - 11, y + 12, 3, 14);
  ctx.fillStyle = C.tableLeg;
  ctx.fillRect(x + 7, y + 12, 3, 14);
  ctx.fillRect(x + S - 12, y + 12, 3, 14);

  ctx.fillStyle = C.tableLeg;
  ctx.fillRect(x + 7, y + 20, S - 14, 2);

  ctx.fillStyle = C.tableTopSh;
  ctx.fillRect(x + 4, y + 6, S - 6, 8);
  ctx.fillStyle = C.tableTop;
  ctx.fillRect(x + 3, y + 4, S - 6, 8);
  ctx.fillStyle = C.tableTopHi;
  ctx.fillRect(x + 3, y + 4, S - 6, 2);
  ctx.fillRect(x + 3, y + 4, 2, 8);

  if (h % 3 === 0) {
    ctx.strokeStyle = C.tableRing;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 10 + (h % 8), y + 8, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  const cupX = x + 6 + (h % 10);
  ctx.fillStyle = '#F0EDE8';
  ctx.fillRect(cupX, y + 5, 4, 3);
  ctx.fillStyle = '#C07840';
  ctx.fillRect(cupX + 1, y + 6, 2, 1);
}

function drawChair(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;

  drawCarpet(ctx, x, y, col, row);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + 5, y + 22, S - 10, 6);

  ctx.fillStyle = C.chairLeg;
  ctx.fillRect(x + 8, y + 14, 2, 12);
  ctx.fillRect(x + S - 10, y + 14, 2, 12);
  ctx.fillStyle = '#282818';
  ctx.fillRect(x + 7, y + 26, 4, 2);
  ctx.fillRect(x + S - 11, y + 26, 4, 2);

  ctx.fillStyle = C.chairSeat;
  ctx.fillRect(x + 4, y + 10, S - 8, 6);
  ctx.fillStyle = C.chairCushion;
  ctx.fillRect(x + 4, y + 10, S - 8, 3);
  ctx.fillStyle = C.chairSeatHi;
  ctx.fillRect(x + 4, y + 10, S - 8, 1);
  ctx.fillRect(x + 4, y + 10, 2, 6);

  const backH = 8;
  ctx.fillStyle = C.chairBack;
  ctx.fillRect(x + 6, y + 2, S - 12, backH);
  ctx.fillStyle = C.chairCushion;
  ctx.fillRect(x + 6, y + 2, S - 12, 3);
  ctx.fillStyle = C.chairSeatHi;
  ctx.fillRect(x + 6, y + 2, S - 12, 1);

  ctx.fillStyle = '#5A2A10';
  ctx.fillRect(x + 6, y + 8, S - 12, 2);

  ctx.fillStyle = C.chairLeg;
  ctx.fillRect(x + 8, y + 10, 2, 2);
  ctx.fillRect(x + S - 10, y + 10, 2, 2);
}

function drawPlant(ctx, x, y, col, row) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 2000;

  drawCarpet(ctx, x, y, col, row);

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + 6, y + 24, 20, 6);

  ctx.fillStyle = C.potBase;
  ctx.fillRect(x + 8, y + 18, 16, 10);
  ctx.fillStyle = C.potHi;
  ctx.fillRect(x + 8, y + 18, 16, 3);
  ctx.fillRect(x + 8, y + 18, 2, 10);
  ctx.fillStyle = C.potSoil;
  ctx.fillRect(x + 6, y + 16, 20, 3);
  ctx.fillStyle = '#5A3018';
  ctx.fillRect(x + 6, y + 16, 20, 1);
  ctx.fillStyle = C.potSoil;
  ctx.fillRect(x + 8, y + 14, 16, 4);

  ctx.fillStyle = '#2A5010';
  ctx.fillRect(x + 14, y + 6, 4, 10);

  const sway = Math.sin(t) * 1;

  ctx.fillStyle = C.leafDark;
  ctx.fillRect(x + 4 + sway, y + 4, 10, 6);
  ctx.fillStyle = C.leafMid;
  ctx.fillRect(x + 4 + sway, y + 4, 8, 4);
  ctx.fillStyle = C.leafLight;
  ctx.fillRect(x + 5 + sway, y + 4, 5, 2);
  ctx.fillStyle = C.leafHi;
  ctx.fillRect(x + 5 + sway, y + 4, 2, 1);

  ctx.fillStyle = C.leafDark;
  ctx.fillRect(x + 18 - sway, y + 2, 10, 8);
  ctx.fillStyle = C.leafMid;
  ctx.fillRect(x + 18 - sway, y + 2, 8, 6);
  ctx.fillStyle = C.leafLight;
  ctx.fillRect(x + 19 - sway, y + 2, 5, 3);
  ctx.fillStyle = C.leafHi;
  ctx.fillRect(x + 20 - sway, y + 2, 2, 1);

  ctx.fillStyle = C.leafMid;
  ctx.fillRect(x + 10, y + 0, 12, 6);
  ctx.fillStyle = C.leafLight;
  ctx.fillRect(x + 11, y + 0, 8, 3);
  ctx.fillStyle = C.leafHi;
  ctx.fillRect(x + 12, y + 0, 4, 1);
}

function drawCafeDoor(ctx, x, y) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 1000;

  drawFloorWood(ctx, x, y, 0, 5);

  ctx.fillStyle = C.doorFrame;
  ctx.fillRect(x, y, S, S);

  const dw = 10,
    dh = 24;
  const dx = x + (S - dw) / 2;
  const dy = y + (S - dh) - 2;

  ctx.fillStyle = '#3A1E08';
  ctx.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
  ctx.fillStyle = C.doorFrame;
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 1);

  ctx.fillStyle = C.doorGlass;
  ctx.fillRect(dx, dy, dw, dh);

  ctx.fillStyle = C.doorGlassHi;
  ctx.fillRect(dx + 2, dy + 2, 2, dh - 4);
  ctx.fillRect(dx + 2, dy + 2, dw - 4, 2);

  const gAlpha = ((Math.sin(t / 1.2) + 1) / 2) * 0.12 + 0.15;
  ctx.fillStyle = `rgba(255,210,120,${gAlpha})`;
  ctx.fillRect(dx, dy, dw, dh);

  ctx.fillStyle = C.doorHandle;
  ctx.fillRect(dx + dw - 3, dy + dh / 2 - 1, 4, 3);
  ctx.fillStyle = '#FFE090';
  ctx.fillRect(dx + dw - 2, dy + dh / 2 - 1, 2, 1);

  ctx.fillStyle = 'rgba(255,240,200,0.8)';
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', x + S / 2, y + 4);
}

// ── PINTU TERKUNCI CAFÉ (tile 3) ──             ← BARU
function drawCafeLockedDoor(ctx, x, y) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 1000;

  // Lantai di bawah pintu
  drawFloorWood(ctx, x, y, 13, 8);

  // ── Frame pintu — kayu gelap tebal ──
  ctx.fillStyle = C.lockedFrame;
  ctx.fillRect(x, y, S, S);

  const fw = 14,
    fh = 22;
  const fx = x + (S - fw) / 2;
  const fy = y + (S - fh) - 2;

  // Outer frame
  ctx.fillStyle = C.lockedFrame;
  ctx.fillRect(fx - 3, fy - 3, fw + 6, fh + 3);

  // Inner frame (sedikit lebih terang)
  ctx.fillStyle = C.lockedFrameIn;
  ctx.fillRect(fx - 1, fy - 1, fw + 2, fh + 1);

  // ── Panel pintu kayu (bukan kaca — tertutup rapat) ──
  // Plank horizontal
  ctx.fillStyle = C.lockedPlank;
  ctx.fillRect(fx, fy, fw, fh);

  // Garis plank horizontal
  ctx.fillStyle = C.lockedPlankLine;
  for (let py2 = fy + 5; py2 < fy + fh; py2 += 5) {
    ctx.fillRect(fx, py2, fw, 1);
  }

  // Highlight sisi kiri plank
  ctx.fillStyle = 'rgba(255,200,100,0.08)';
  ctx.fillRect(fx, fy, 2, fh);

  // Shadow sisi kanan
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(fx + fw - 2, fy, 2, fh);

  // ── GEMBOK / RANTAI ──
  const lockX = fx + Math.floor(fw / 2) - 3;
  const lockY = fy + Math.floor(fh / 2) - 4;

  // Rantai — dua link di kiri & kanan
  ctx.fillStyle = C.lockedChain;
  ctx.fillRect(lockX - 4, lockY + 2, 3, 2); // rantai kiri
  ctx.fillRect(lockX + 8, lockY + 2, 3, 2); // rantai kanan
  ctx.fillStyle = C.lockedChainDk;
  ctx.fillRect(lockX - 4, lockY + 3, 3, 1);
  ctx.fillRect(lockX + 8, lockY + 3, 3, 1);

  // Body gembok
  ctx.fillStyle = C.lockedMetal;
  ctx.fillRect(lockX, lockY + 2, 8, 7);

  // Shackle (busur gembok)
  ctx.fillStyle = C.lockedMetal;
  ctx.fillRect(lockX + 1, lockY - 2, 2, 5); // kaki kiri shackle
  ctx.fillRect(lockX + 5, lockY - 2, 2, 5); // kaki kanan shackle
  ctx.fillRect(lockX + 1, lockY - 2, 6, 2); // atas shackle

  // Highlight shackle
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(lockX + 1, lockY - 2, 6, 1);
  ctx.fillRect(lockX + 1, lockY - 2, 1, 4);

  // Shadow body gembok
  ctx.fillStyle = C.lockedKeyholeRim;
  ctx.fillRect(lockX, lockY + 2, 8, 1); // highlight atas
  ctx.fillRect(lockX, lockY + 2, 1, 7); // highlight kiri
  ctx.fillStyle = '#404040';
  ctx.fillRect(lockX + 7, lockY + 2, 1, 7); // shadow kanan
  ctx.fillRect(lockX, lockY + 8, 8, 1); // shadow bawah

  // Lubang kunci
  ctx.fillStyle = C.lockedKeyhole;
  ctx.fillRect(lockX + 3, lockY + 4, 2, 2);
  ctx.fillRect(lockX + 3, lockY + 5, 2, 2);

  // ── Warning glow merah berdenyut di frame ──
  const warnAlpha = ((Math.sin(t * 2.5) + 1) / 2) * 0.25 + 0.08;
  ctx.fillStyle = `rgba(220,60,0,${warnAlpha})`;
  ctx.fillRect(fx - 3, fy - 3, fw + 6, fh + 3);

  // Label kecil di atas
  ctx.fillStyle = `rgba(255,100,50,${0.6 + Math.sin(t * 2) * 0.2})`;
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TERKUNCI', x + S / 2, fy - 5);
}

// ── PINTU TERBUKA CAFÉ (tile 3 setelah unlock) ──  ← BARU
function drawCafeOpenDoor(ctx, x, y) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 1000;

  drawFloorWood(ctx, x, y, 13, 8);

  // Frame
  ctx.fillStyle = C.lockedFrame;
  ctx.fillRect(x, y, S, S);

  const fw = 14,
    fh = 22;
  const fx = x + (S - fw) / 2;
  const fy = y + (S - fh) - 2;

  ctx.fillStyle = C.lockedFrame;
  ctx.fillRect(fx - 3, fy - 3, fw + 6, fh + 3);
  ctx.fillStyle = C.lockedFrameIn;
  ctx.fillRect(fx - 1, fy - 1, fw + 2, fh + 1);

  // Kaca (pintu terbuka — bisa ditembus)
  ctx.fillStyle = '#A8D4E8';
  ctx.fillRect(fx, fy, fw, fh);

  // Glow hijau — tanda bisa masuk
  const gA = ((Math.sin(t * 1.5) + 1) / 2) * 0.2 + 0.15;
  ctx.fillStyle = `rgba(80,220,120,${gA})`;
  ctx.fillRect(fx, fy, fw, fh);

  ctx.fillStyle = 'rgba(180,255,200,0.5)';
  ctx.fillRect(fx + 2, fy + 2, 3, fh - 4);

  // Handle
  ctx.fillStyle = C.doorHandle;
  ctx.fillRect(fx + fw - 3, fy + fh / 2 - 1, 4, 3);

  // Label
  ctx.fillStyle = `rgba(100,255,150,${0.7 + Math.sin(t * 2) * 0.2})`;
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LANJUT >', x + S / 2, fy - 5);
}

// ============================================
// OVERLAYS KHUSUS
// ============================================

function drawCoffeeMachine(ctx, x, y) {
  const S = TILE_SIZE_CAFE;
  const t = Date.now() / 1000;

  ctx.fillStyle = C.machineBody;
  ctx.fillRect(x + 2, y - 20, 28, 24);

  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(x + 2, y - 20, 28, 1);
  ctx.fillRect(x + 2, y - 20, 1, 24);
  ctx.fillRect(x + 29, y - 20, 1, 24);

  ctx.fillStyle = C.machineAccent;
  ctx.fillRect(x + 2, y - 16, 28, 2);

  ctx.fillStyle = C.machineLcd;
  ctx.fillRect(x + 5, y - 18, 12, 6);
  ctx.fillStyle = C.machineLcdOn;
  ctx.fillRect(x + 7, y - 17, 8, 1);
  ctx.fillRect(x + 7, y - 15, 4, 1);

  const btnA = ((Math.sin(t * 1.5) + 1) / 2) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(192,168,48,${btnA})`;
  ctx.fillRect(x + 20, y - 17, 6, 4);
  ctx.fillStyle = '#A08020';
  ctx.fillRect(x + 21, y - 16, 4, 2);

  ctx.fillStyle = C.machineGroup;
  ctx.fillRect(x + 8, y - 2, 16, 6);
  ctx.fillStyle = '#505050';
  ctx.fillRect(x + 10, y + 2, 12, 2);

  ctx.fillStyle = '#606060';
  ctx.fillRect(x + 12, y + 4, 8, 4);
  ctx.fillStyle = '#808080';
  ctx.fillRect(x + 12, y + 4, 8, 1);

  ctx.fillStyle = C.counterSteelDk;
  ctx.fillRect(x + 24, y - 10, 2, 14);
  ctx.fillStyle = C.counterSteel;
  ctx.fillRect(x + 24, y - 10, 2, 2);
  ctx.fillRect(x + 22, y + 4, 6, 2);

  ctx.fillStyle = '#484848';
  ctx.fillRect(x + 4, y + 3, 22, 2);
  ctx.fillStyle = '#383838';
  for (let gx2 = 0; gx2 < 5; gx2++) {
    ctx.fillRect(x + 5 + gx2 * 4, y + 3, 2, 2);
  }

  const steamA = ((Math.sin(t * 2.2) + 1) / 2) * 0.5 + 0.1;
  ctx.fillStyle = `rgba(230,230,245,${steamA})`;
  ctx.fillRect(x + 13, y - 26, 3, 6);
  ctx.fillRect(x + 12, y - 30, 2, 4);
  ctx.fillRect(x + 14, y - 33, 2, 3);
}

function drawCounterOverlays(ctx) {
  const S = TILE_SIZE_CAFE;

  drawCoffeeMachine(ctx, 3 * S, 2 * S);

  const jarPositions = [
    { col: 5, row: 1 },
    { col: 8, row: 1 },
    { col: 11, row: 1 },
  ];

  for (const jp of jarPositions) {
    const jx = jp.col * S;
    const jy = jp.row * S;

    ctx.fillStyle = 'rgba(180,220,240,0.7)';
    ctx.fillRect(jx + 12, jy + 8, 8, 12);
    ctx.fillStyle = 'rgba(220,250,255,0.5)';
    ctx.fillRect(jx + 13, jy + 8, 3, 10);
    ctx.fillStyle = '#8B5E30';
    ctx.fillRect(jx + 11, jy + 7, 10, 2);
    ctx.fillStyle = '#2A1500';
    ctx.fillRect(jx + 12, jy + 16, 8, 4);
  }

  const mbx = 9 * S;
  const mby = 0;
  ctx.fillStyle = '#1A0800';
  ctx.fillRect(mbx + 2, mby + 2, 3 * S - 4, 20);
  ctx.fillStyle = '#3A2010';
  ctx.fillRect(mbx + 3, mby + 3, 3 * S - 6, 18);
  ctx.fillStyle = '#F0D870';
  ctx.font = '5px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('☕ Americano  18k', mbx + 6, mby + 10);
  ctx.fillText('🥛 Latte      22k', mbx + 6, mby + 16);
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(mbx + 2, mby + 0, 3 * S - 4, 3);
  ctx.fillStyle = '#808060';
  ctx.fillRect(mbx + 2, mby + 0, 3 * S - 4, 1);
}

// ============================================
// PIXEL ART NPC LAKI-LAKI — Arya              ← BARU
//
// Arya: pengunjung muda, kasual
//   - Rambut pendek, sedikit acak-acakan
//   - Kemeja warna biru muda, celana dark grey
//   - Duduk santai di kursi pojok
//   - Tangan di atas meja, ada secangkir kopi
// ============================================

const PX = 2;

function px(ctx, x, y, color, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * PX, h * PX);
}

// Palette Arya
const ARYA = {
  skin: '#E8B888',
  skinShade: '#C89060',
  skinDark: '#A86838',
  skinRosy: '#D89878',

  hair: '#1A1008',
  hairHi: '#302018',
  hairMid: '#241810',

  eye: '#1A0800',
  eyeWhite: '#FFF5EE',
  eyeShine: '#FFFFFF',

  shirt: '#4A7AC8', // biru muda — karakter muda
  shirtHi: '#6090DC',
  shirtShad: '#2A5098',

  pants: '#3A3A4A', // dark grey
  pantsHi: '#4A4A5A',
  pantsShad: '#2A2A3A',

  shoes: '#201810',
  shoesHi: '#302820',

  shadow: 'rgba(60,30,0,0.22)',
};

/**
 * drawPartyHat(ctx, x, py2)
 * Topi pesta ulang tahun kerucut di kepala Arya — biru-kuning
 * dengan pom-pom putih di puncak dan garis spiral dekorasi.
 *
 * @param {number} x   - posisi x kepala NPC
 * @param {number} py2 - posisi y kepala NPC (sudah termasuk bob animation)
 */
function drawPartyHat(ctx, x, py2) {
  const cx = x + 12; // tengah kepala (kepala lebar 12px: x+6 s.d x+18)
  const hatTopY = py2 - 9; // puncak topi
  const hatBaseY = py2 + 1; // dasar topi (menempel di atas kepala)

  // ── Badan topi (kerucut) ──
  ctx.fillStyle = '#4A7AC8'; // biru — selaras shirt Arya
  ctx.beginPath();
  ctx.moveTo(cx - 7, hatBaseY);
  ctx.lineTo(cx + 7, hatBaseY);
  ctx.lineTo(cx, hatTopY);
  ctx.closePath();
  ctx.fill();

  // Garis dekorasi spiral kuning
  ctx.strokeStyle = '#FFD166';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 5, hatBaseY - 1);
  ctx.lineTo(cx - 1, hatTopY + 4);
  ctx.moveTo(cx + 5, hatBaseY - 1);
  ctx.lineTo(cx + 1, hatTopY + 4);
  ctx.stroke();

  // Highlight sisi kiri topi
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx - 6, hatBaseY);
  ctx.lineTo(cx - 1, hatTopY + 1);
  ctx.lineTo(cx - 2, hatBaseY);
  ctx.closePath();
  ctx.fill();

  // ── Tali pinggir bawah topi ──
  ctx.fillStyle = '#FF6B81';
  ctx.fillRect(cx - 7, hatBaseY - 1, 14, 2);

  // ── Pom-pom putih di puncak ──
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, hatTopY, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,220,220,0.6)';
  ctx.beginPath();
  ctx.arc(cx + 0.6, hatTopY + 0.6, 1, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * drawMaleNPC(ctx, x, y, isNearby, isInteracted)
 * Pixel art Arya — menghadap depan (facing down = ke camera)
 * dengan animasi idle bob ringan, plus topi pesta ulang tahun.
 */
function drawMaleNPC(ctx, x, y, isNearby, isInteracted) {
  const bob = Math.floor(Date.now() / 700) % 2 === 0 ? 0 : -1;
  const py2 = y + bob;

  // Shadow
  ctx.fillStyle = ARYA.shadow;
  ctx.fillRect(x + 4, y + 24, 16, 3);

  // ── Sepatu ──
  px(ctx, x + 6, py2 + 22, ARYA.shoes, 4, 2);
  px(ctx, x + 12, py2 + 22, ARYA.shoes, 4, 2);
  px(ctx, x + 6, py2 + 22, ARYA.shoesHi, 2, 1);
  px(ctx, x + 12, py2 + 22, ARYA.shoesHi, 2, 1);

  // ── Celana ──
  px(ctx, x + 5, py2 + 17, ARYA.pants, 14, 6);
  px(ctx, x + 5, py2 + 17, ARYA.pantsHi, 14, 1);
  px(ctx, x + 5, py2 + 17, ARYA.pantsHi, 1, 6);
  px(ctx, x + 18, py2 + 17, ARYA.pantsShad, 1, 6);
  // Lipatan tengah celana
  px(ctx, x + 11, py2 + 17, ARYA.pantsShad, 1, 6);

  // ── Tangan / lengan ──
  // Tangan kiri
  px(ctx, x + 2, py2 + 13, ARYA.shirt, 2, 5);
  px(ctx, x + 2, py2 + 18, ARYA.skin, 2, 2);
  // Tangan kanan
  px(ctx, x + 20, py2 + 13, ARYA.shirt, 2, 5);
  px(ctx, x + 20, py2 + 18, ARYA.skin, 2, 2);

  // ── Badan / kemeja ──
  px(ctx, x + 4, py2 + 11, ARYA.shirtShad, 16, 1);
  px(ctx, x + 4, py2 + 12, ARYA.shirt, 16, 6);
  px(ctx, x + 4, py2 + 12, ARYA.shirtHi, 16, 2);
  px(ctx, x + 4, py2 + 12, ARYA.shirtHi, 2, 6);
  px(ctx, x + 18, py2 + 12, ARYA.shirtShad, 2, 6);
  // Kerah kemeja
  px(ctx, x + 9, py2 + 12, ARYA.skinShade ?? ARYA.skinDark, 2, 2);
  px(ctx, x + 13, py2 + 12, ARYA.skinShade ?? ARYA.skinDark, 2, 2);
  // Kancing tengah
  px(ctx, x + 11, py2 + 13, '#FFFFFF', 1, 1);
  px(ctx, x + 11, py2 + 15, '#FFFFFF', 1, 1);

  // ── Leher ──
  px(ctx, x + 10, py2 + 9, ARYA.skin, 4, 3);
  px(ctx, x + 10, py2 + 9, ARYA.skinShade, 1, 3);

  // ── Kepala ──
  // Wajah base
  px(ctx, x + 6, py2 + 2, ARYA.skin, 12, 7);

  // Outline kepala
  px(ctx, x + 6, py2 + 1, ARYA.hair, 12, 1); // atas
  px(ctx, x + 5, py2 + 2, ARYA.hair, 1, 7); // kiri
  px(ctx, x + 18, py2 + 2, ARYA.hair, 1, 7); // kanan
  px(ctx, x + 6, py2 + 9, ARYA.hair, 1, 1);
  px(ctx, x + 17, py2 + 9, ARYA.hair, 1, 1);

  // Shadow pipi kiri
  px(ctx, x + 6, py2 + 2, ARYA.skinShade, 1, 7);

  // Sedikit bayangan rahang bawah
  px(ctx, x + 7, py2 + 8, ARYA.skinDark, 10, 1);

  // ── Rambut — pendek, sedikit acak ──
  px(ctx, x + 6, py2 + 1, ARYA.hair, 12, 3);
  px(ctx, x + 6, py2 + 1, ARYA.hairHi, 5, 1);
  // Rambut sisi kiri
  px(ctx, x + 5, py2 + 2, ARYA.hairMid, 2, 4);
  // Rambut sisi kanan
  px(ctx, x + 17, py2 + 2, ARYA.hairMid, 2, 4);
  // Acak-acakan — strand naik sedikit di atas
  px(ctx, x + 8, py2 + 0, ARYA.hair, 2, 2);
  px(ctx, x + 12, py2 + 0, ARYA.hair, 3, 2);
  px(ctx, x + 10, py2 + 1, ARYA.hair, 2, 1);

  // ── Mata ──
  // Mata kiri — sedikit lebih sempit dari female NPC (maskulin)
  px(ctx, x + 8, py2 + 5, ARYA.eyeWhite, 3, 2);
  px(ctx, x + 8, py2 + 5, ARYA.eye, 2, 2);
  px(ctx, x + 9, py2 + 5, ARYA.eyeShine, 1, 1);
  px(ctx, x + 8, py2 + 4, ARYA.hair, 3, 1); // alis kiri
  // Mata kanan
  px(ctx, x + 13, py2 + 5, ARYA.eyeWhite, 3, 2);
  px(ctx, x + 14, py2 + 5, ARYA.eye, 2, 2);
  px(ctx, x + 14, py2 + 5, ARYA.eyeShine, 1, 1);
  px(ctx, x + 13, py2 + 4, ARYA.hair, 3, 1); // alis kanan

  // Hidung
  px(ctx, x + 11, py2 + 7, ARYA.skinDark, 2, 1);

  // Mulut — lebih lurus (ekspresi netral, sedikit tersenyum)
  px(ctx, x + 9, py2 + 8, ARYA.skinDark, 6, 1);
  px(ctx, x + 9, py2 + 8, ARYA.skinDark, 1, 1);
  px(ctx, x + 14, py2 + 8, ARYA.skinDark, 1, 1);

  // Sedikit bayangan di bawah rahang (kontur maskulin)
  px(ctx, x + 7, py2 + 9, 'rgba(0,0,0,0.12)', 10, 1);

  // ── Topi pesta ulang tahun (party hat) ──
  drawPartyHat(ctx, x, py2);

  // ── Cangkir kopi di depan Arya (di meja) ──
  // Digambar sedikit di bawah NPC agar terlihat di depannya
  const cupX = x + 8;
  const cupY = y + 26;
  ctx.fillStyle = '#F0EDE8';
  ctx.fillRect(cupX, cupY, 8, 5);
  ctx.fillStyle = '#E8E0D8';
  ctx.fillRect(cupX + 1, cupY + 1, 6, 3);
  ctx.fillStyle = '#5A2A10'; // isi kopi
  ctx.fillRect(cupX + 1, cupY + 1, 6, 2);
  ctx.fillStyle = '#C09050'; // piringan
  ctx.fillRect(cupX - 1, cupY + 4, 10, 2);
  // Handle cangkir
  ctx.fillStyle = '#D8D0C8';
  ctx.fillRect(cupX + 8, cupY + 1, 2, 3);
  ctx.fillStyle = '#F0EDE8';
  ctx.fillRect(cupX + 8, cupY + 2, 1, 1);
  // Uap kopi ringan
  const steamA = ((Math.sin(Date.now() / 500) + 1) / 2) * 0.4 + 0.15;
  ctx.fillStyle = `rgba(220,220,230,${steamA})`;
  ctx.fillRect(cupX + 3, cupY - 3, 1, 3);
  ctx.fillRect(cupX + 5, cupY - 4, 1, 4);

  // ── Highlight ring saat dekat ──
  if (isNearby) {
    ctx.strokeStyle = 'rgba(255,200,100,0.90)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, 28, 32);
  }

  // ── Tanda centang jika sudah diajak ngobrol ──
  if (isInteracted) {
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#44ff44';
    ctx.fillText('✓', x + 12, y - 4);
  }
}

// ============================================
// RENDER NPC CAFÉ                              ← BARU
// ============================================

export function renderCafeNPCs(ctx, nearbyCafeNPC) {
  for (const npc of cafeNpcList) {
    const isNearby = nearbyCafeNPC?.id === npc.id;
    const isInteracted = isCafeNPCInteracted(npc.id);

    // Saat ini hanya ada Arya — selalu pakai drawMaleNPC
    drawMaleNPC(ctx, npc.x, npc.y, isNearby, isInteracted);

    // Nama label di bawah NPC
    const cx = npc.x + 12;
    const ny = npc.y + 40;
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(npc.label, cx + 1, ny + 1);
    ctx.fillStyle = isInteracted ? '#88cc88' : '#e8e8c0';
    ctx.fillText(npc.label, cx, ny);

    // Prompt interaksi saat dekat
    if (isNearby) {
      const bounce = Math.sin(Date.now() / 300) * 2;
      renderCafeNPCPrompt(ctx, npc, bounce);
    }
  }
}

function renderCafeNPCPrompt(ctx, npc, bounce) {
  const isMobile = 'ontouchstart' in window;
  const label = isMobile ? '[ E ]' : '[ E ]';
  const text = `${label} Ngobrol`;

  const cx = npc.x + npc.width / 2;
  const cy = npc.y - 14 + bounce;
  const pWidth = ctx.measureText(text).width + 10;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

// ============================================
// PROMPT OVERLAYS                              ← BARU
// ============================================

/** Prompt saat dekat locked door di café — belum punya kunci */
export function renderCafeLockedDoorPrompt(ctx, hasInteractedArya) {
  const S = TILE_SIZE_CAFE;
  const doorX = CAFE_LOCKED_DOOR.col * S;
  const doorY = CAFE_LOCKED_DOOR.row * S;

  const bounce = Math.sin(Date.now() / 500) * 1.5;
  const cx = doorX + S / 2;
  const cy = doorY - 16 + bounce;

  // Jika belum ngobrol Arya — info merah
  const text = hasInteractedArya
    ? '[ E ] Buka Pintu'
    : '[ ! ] Ajak Arya Ngobrol Dulu';

  const pWidth = ctx.measureText(text).width + 12;

  ctx.fillStyle = hasInteractedArya
    ? 'rgba(20,80,20,0.85)'
    : 'rgba(100,20,0,0.85)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  ctx.fillStyle = hasInteractedArya ? '#80FF80' : '#FF8060';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

/** Prompt saat pintu sudah terbuka — bisa masuk map 3 */
export function renderCafeOpenDoorPrompt(ctx) {
  const S = TILE_SIZE_CAFE;
  const doorX = CAFE_LOCKED_DOOR.col * S;
  const doorY = CAFE_LOCKED_DOOR.row * S;

  const bounce = Math.sin(Date.now() / 400) * 2;
  const cx = doorX + S / 2;
  const cy = doorY - 16 + bounce;
  const text = 'ontouchstart' in window ? '[E] Lanjut' : '[E] Lanjut';
  const pWidth = ctx.measureText(text).width + 12;

  ctx.fillStyle = 'rgba(0,120,60,0.88)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  ctx.fillStyle = '#AAFFCC';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

/** Prompt keluar café */
export function renderCafeExitPrompt(ctx) {
  const S = TILE_SIZE_CAFE;
  const doorX = CAFE_EXIT_DOOR.col * S;
  const doorY = CAFE_EXIT_DOOR.row * S;

  const bounce = Math.sin(Date.now() / 400) * 2;
  const cx = doorX + S / 2;
  const cy = doorY - 10 + bounce;
  const text = `${'ontouchstart' in window ? '[E]' : '[E]'} Keluar`;
  const pWidth = ctx.measureText(text).width + 12;

  ctx.fillStyle = 'rgba(0,120,180,0.85)';
  ctx.beginPath();
  ctx.roundRect(cx - pWidth / 2, cy - 8, pWidth, 14, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 2);
}

// ============================================
// MAIN RENDER CAFÉ
// ============================================

export function renderCafeMap(ctx) {
  ctx.imageSmoothingEnabled = false;

  const rows = CAFE_MAP_DATA.length;
  const cols = CAFE_MAP_DATA[0].length;
  const S = TILE_SIZE_CAFE;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = CAFE_MAP_DATA[row][col];
      const x = col * S;
      const y = row * S;

      switch (tile) {
        case 0:
          drawFloorWood(ctx, x, y, col, row);
          break;
        case 9:
          drawCarpet(ctx, x, y, col, row);
          break;
        case 1:
          drawWallCafe(ctx, x, y, col, row);
          break;
        case 7:
          drawWindow(ctx, x, y, col, row);
          break;
        case 6:
          drawCounter(ctx, x, y, col, row);
          break;
        case 4:
          drawTable(ctx, x, y, col, row);
          break;
        case 5:
          drawChair(ctx, x, y, col, row);
          break;
        case 8:
          drawPlant(ctx, x, y, col, row);
          break;
        case 2:
          drawCafeDoor(ctx, x, y);
          break;
        case 3: // ← BARU
          if (_cafeDoorUnlocked) drawCafeOpenDoor(ctx, x, y);
          else drawCafeLockedDoor(ctx, x, y);
          break;
        default:
          drawFloorWood(ctx, x, y, col, row);
          break;
      }
    }
  }

  // Ambient warm overlay
  ctx.fillStyle = 'rgba(255,200,100,0.04)';
  ctx.fillRect(0, 0, cols * S, rows * S);

  drawCounterOverlays(ctx);
  drawBirthdayCake(ctx); // kue ulang tahun di meja Arya
  drawFloatingConfetti(ctx); // confetti melayang di seluruh ruangan
}

/**
 * drawBirthdayCake(ctx)
 * Kue ulang tahun pixel art di atas meja Arya (col 12, row 7).
 * Lilin menyala dengan animasi flicker.
 */
function drawBirthdayCake(ctx) {
  const S = TILE_SIZE_CAFE;
  const tableCol = 12,
    tableRow = 7;
  const tx = tableCol * S;
  const ty = tableRow * S;

  // Posisi kue — sedikit di atas tengah meja (meja sudah punya gambar sendiri)
  const cx = tx + S / 2;
  const cy = ty + S / 2 - 3;

  // ── Piring ──
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 7, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,200,210,0.6)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Lapisan bawah kue (coklat) ──
  ctx.fillStyle = '#7A4A28';
  ctx.fillRect(cx - 9, cy - 1, 18, 7);
  ctx.fillStyle = '#9A6238';
  ctx.fillRect(cx - 9, cy - 1, 18, 2);

  // ── Lapisan atas kue (pink/krim) ──
  ctx.fillStyle = '#F2A8C0';
  ctx.fillRect(cx - 7, cy - 6, 14, 6);
  ctx.fillStyle = '#FFC4DA';
  ctx.fillRect(cx - 7, cy - 6, 14, 2);

  // ── Drip krim turun dari atas ──
  ctx.fillStyle = '#FFF0F5';
  for (let i = -6; i <= 6; i += 3) {
    ctx.fillRect(cx + i, cy - 6, 2, 3 + (Math.abs(i) % 2));
  }

  // ── Hiasan bola-bola kecil warna ──
  const dotColors = ['#FF6B81', '#6FCF97', '#56CCF2', '#FFD166'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = dotColors[i % dotColors.length];
    ctx.beginPath();
    ctx.arc(cx - 6 + i * 4, cy - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Lilin + api dengan flicker ──
  const candleX = [cx - 4, cx, cx + 4];
  const flicker = Math.sin(Date.now() / 120) * 0.5 + 0.5;

  for (const lx of candleX) {
    // Batang lilin
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(lx - 1, cy - 11, 2, 5);
    ctx.fillStyle = '#FF6B81';
    ctx.fillRect(lx - 1, cy - 11, 2, 1);

    // Api lilin — glow + inti
    const glowR = 3 + flicker * 1;
    const grad = ctx.createRadialGradient(lx, cy - 13, 0, lx, cy - 13, glowR);
    grad.addColorStop(0, 'rgba(255,220,120,0.8)');
    grad.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lx, cy - 13, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.ellipse(lx, cy - 12.5, 1.2, 2 + flicker * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.ellipse(lx, cy - 12, 0.7, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * drawFloatingConfetti(ctx)
 * Confetti kecil melayang turun pelan di seluruh ruangan café.
 * Posisi pseudo-random tapi stabil (berdasarkan index + waktu),
 * jadi terlihat halus tanpa state tambahan yang perlu disimpan.
 */
const CONFETTI_COLORS = [
  '#FF6B81',
  '#FFD166',
  '#6FCF97',
  '#56CCF2',
  '#BB6BD9',
  '#FFFFFF',
];
const CONFETTI_COUNT = 18;

function drawFloatingConfetti(ctx) {
  const t = Date.now() / 1000;
  const W = TILE_SIZE_CAFE * 15;
  const H = TILE_SIZE_CAFE * 10;

  for (let i = 0; i < CONFETTI_COUNT; i++) {
    // Seed pseudo-random stabil per index
    const seedX = (i * 137.5) % W;
    const speed = 12 + (i % 5) * 4;
    const fallY = ((t * speed + i * 53) % (H + 20)) - 10;
    const swayX = Math.sin(t * 1.5 + i) * 6;

    const x = seedX + swayX;
    const y = fallY;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 2 + (i % 3);
    const rotation = t * 2 + i;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
    ctx.restore();
  }
}

// ============================================
// ROOM LABELS
// ============================================

export function renderCafeRoomLabels(ctx) {
  const S = TILE_SIZE_CAFE;
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';

  for (const room of CAFE_ROOM_LABELS) {
    const x = room.col * S + 4;
    const y = room.row * S + 12;

    ctx.fillStyle = 'rgba(60,30,10,0.7)';
    ctx.fillText(room.name, x + 1, y + 1);
    ctx.fillStyle = 'rgba(255,220,140,0.9)';
    ctx.fillText(room.name, x, y);
  }
}
