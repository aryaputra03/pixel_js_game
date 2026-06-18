// ============================================
// NPCManager.js — NPC Rendering & Interaction
// Birthday Quest RPG
//
// Perubahan dari versi sebelumnya:
//   - currentInteractingNPCId: simpan NPC mana yang sedang diajak ngobrol
//   - setCurrentInteractingNPC(id): dipanggil main.js sebelum DialogEngine.start()
//   - getCurrentInteractingNPCId(): dipakai DialogEngine.close() via hook
// ============================================

import { NPCS, TILE_SIZE } from '../data/maps.js';
import GameState from './GameState.js';
import { drawNPC } from './SpriteManager.js';
import { drawNPCName, drawInteractPrompt } from './TextRenderer.js';

// ============================================
// KONVERSI GRID → PIXEL
// ============================================
const NPC_SIZE = 24;
const OFFSET = (TILE_SIZE - NPC_SIZE) / 2;

export const npcList = NPCS.map((npc) => ({
  ...npc,
  x: npc.col * TILE_SIZE + OFFSET,
  y: npc.row * TILE_SIZE + OFFSET,
  width: NPC_SIZE,
  height: NPC_SIZE,
}));

// ============================================
// TRACKING NPC YANG SEDANG DIAJAK NGOBROL     ← BARU
// ============================================

// Id NPC yang sedang aktif dialog-nya.
// Di-set oleh main.js sebelum DialogEngine.start(),
// di-clear oleh DialogEngine setelah close() via _onDialogClose hook.
let _currentInteractingNPCId = null;

/**
 * setCurrentInteractingNPC(npcId)
 * Dipanggil main.js saat player tekan E / tap NPC.
 * Menyimpan id NPC sebelum DialogEngine.start() dipanggil.
 */
export function setCurrentInteractingNPC(npcId) {
  _currentInteractingNPCId = npcId;
}

/**
 * getCurrentInteractingNPCId()
 * Diakses oleh DialogEngine.close() untuk tahu NPC mana
 * yang baru selesai diajak ngobrol.
 */
export function getCurrentInteractingNPCId() {
  return _currentInteractingNPCId;
}

/**
 * clearCurrentInteractingNPC()
 * Reset setelah dialog selesai. Dipanggil DialogEngine.close().
 */
export function clearCurrentInteractingNPC() {
  _currentInteractingNPCId = null;
}

// ============================================
// PROXIMITY DETECTION
// ============================================

const INTERACT_RADIUS = 48;

export function getNearbyNPC(px, py) {
  const pcx = px + 14;
  const pcy = py + 14;

  return (
    npcList.find((npc) => {
      const ncx = npc.x + NPC_SIZE / 2;
      const ncy = npc.y + NPC_SIZE / 2;
      const dx = ncx - pcx;
      const dy = ncy - pcy;
      return Math.sqrt(dx * dx + dy * dy) < INTERACT_RADIUS;
    }) ?? null
  );
}

// ============================================
// RENDER
// ============================================

export function renderNPCs(ctx, nearbyNPC) {
  for (const npc of npcList) {
    const isNearby = nearbyNPC?.id === npc.id;
    const isInteracted = GameState.npcInteracted.has(npc.id); // ← BARU

    // Gambar NPC — sedikit redup jika sudah pernah diajak ngobrol
    // sehingga player tahu mana yang sudah & belum dikunjungi
    drawNPC(ctx, npc.x, npc.y, npc.color, isNearby, isInteracted);

    if (isNearby) {
      const bounce = Math.sin(Date.now() / 300) * 2;
      renderInteractPrompt(ctx, npc, bounce);
    }

    // Nama NPC — pakai TextRenderer agar tajam
    drawNPCName(ctx, npc.label, npc.x + 12, npc.y + 36, isInteracted);

    // Tanda centang di atas NPC yang sudah diajak ngobrol
    if (isInteracted) {
      drawNPCName(ctx, '✓', npc.x + 12, npc.y - 4, true);
    }
  }
}

function renderInteractPrompt(ctx, npc, bounce) {
  const isMobile = 'ontouchstart' in window;
  const label = isMobile ? '[ E ]' : '[ E ]';
  const text = `${label} Ngobrol`;
  const cx = npc.x + npc.width / 2;
  const cy = npc.y - 16 + bounce;
  drawInteractPrompt(ctx, text, cx, cy);
}

export function getInteractKey() {
  return 'e';
}
