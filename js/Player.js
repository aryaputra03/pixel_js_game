// ============================================
// Player.js — Player Object & Movement
// Birthday Quest RPG · Tahap 9: Sprite + Sound
//
// Perubahan dari versi sebelumnya:
//   - _collisionFn: fungsi collision yang bisa di-swap saat ganti map
//   - setCollisionFn(fn): dipanggil main.js saat transisi map
//     null = pakai default isSolidAtPixel dari MapRenderer (map1)
//     isSolidCafeAtPixel = dipakai saat di café
// ============================================

import { isSolidAtPixel } from './MapRenderer.js';
import GameState from './GameState.js';
import {
  drawPlayer,
  setPlayerDirection,
  tickSprites,
  playerDirection,
  playerMoving,
} from './SpriteManager.js';
import SoundManager from './SoundManager.js';

// ============================================
// PLAYER OBJECT
// ============================================

export const player = {
  get x() {
    return GameState.player.x;
  },
  set x(v) {
    GameState.player.x = v;
  },
  get y() {
    return GameState.player.y;
  },
  set y(v) {
    GameState.player.y = v;
  },

  width: 24,
  height: 28,
  speed: 2,

  get name() {
    return GameState.player.name;
  },
  get hp() {
    return GameState.player.hp;
  },
};

// ============================================
// COLLISION FUNCTION — swappable per map      ← BARU
//
// Default: isSolidAtPixel dari MapRenderer (map 1)
// Saat di café: diganti dengan isSolidCafeAtPixel
// oleh main.js via setCollisionFn()
// ============================================

let _collisionFn = null; // null = pakai default

/**
 * setCollisionFn(fn)
 * Ganti fungsi collision yang dipakai player.
 * Dipanggil main.js saat transisi antar map.
 *
 * @param {Function|null} fn - (px, py) => boolean. null = pakai default map1.
 */
export function setCollisionFn(fn) {
  _collisionFn = fn;
}

function checkSolid(px, py) {
  if (_collisionFn) return _collisionFn(px, py);
  return isSolidAtPixel(px, py);
}

// ============================================
// COLLISION
// ============================================

function canMoveTo(newX, newY) {
  const m = 2;
  return (
    !checkSolid(newX + m, newY + m) &&
    !checkSolid(newX + player.width - m, newY + m) &&
    !checkSolid(newX + m, newY + player.height - m) &&
    !checkSolid(newX + player.width - m, newY + player.height - m)
  );
}

// ============================================
// UPDATE
// ============================================

let stepCounter = 0;
const STEP_INTERVAL = 20;

export function updatePlayer(keys) {
  let moved = false;
  let dir = playerDirection;

  if (keys['ArrowRight']) {
    const nx = player.x + player.speed;
    if (canMoveTo(nx, player.y)) {
      player.x = nx;
      moved = true;
      dir = 'right';
    }
  }
  if (keys['ArrowLeft']) {
    const nx = player.x - player.speed;
    if (canMoveTo(nx, player.y)) {
      player.x = nx;
      moved = true;
      dir = 'left';
    }
  }
  if (keys['ArrowDown']) {
    const ny = player.y + player.speed;
    if (canMoveTo(player.x, ny)) {
      player.y = ny;
      moved = true;
      dir = 'down';
    }
  }
  if (keys['ArrowUp']) {
    const ny = player.y - player.speed;
    if (canMoveTo(player.x, ny)) {
      player.y = ny;
      moved = true;
      dir = 'up';
    }
  }

  setPlayerDirection(dir, moved);
  tickSprites();

  if (moved) {
    stepCounter++;
    if (stepCounter >= STEP_INTERVAL) {
      SoundManager.playerStep();
      stepCounter = 0;
    }
  } else {
    stepCounter = 0;
  }
}

// ============================================
// RENDER
// ============================================

export function renderPlayer(ctx) {
  drawPlayer(ctx, player.x, player.y, playerDirection, playerMoving);
}
