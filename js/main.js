// ============================================
// main.js — Entry point & Game Loop
// Birthday Quest RPG
//
// Perubahan dari versi sebelumnya:
//   [1] DEBUG PANEL DIHAPUS — FPS/Phase/Keys tidak ditampilkan
//   [2] resizeCanvas() → FULLSCREEN mode:
//       canvas mengisi SELURUH layar tanpa letterbox hitam.
//       Game di-stretch ke ukuran layar penuh dengan tetap
//       menjaga koordinat logis 480x320 lewat ctx.setTransform.
//   [3] Analog stick tetap ada, ukuran dikendalikan CSS.
// ============================================

import { setupDpad, setupAnalogStick } from './input.js';
import GameState from './GameState.js';
import {
  player,
  updatePlayer,
  renderPlayer,
  setCollisionFn,
} from './Player.js';
import {
  renderMap,
  renderRoomLabels,
  renderLockedDoorPrompt,
  renderOpenDoorPrompt,
  isNearLockedDoor,
  isNearOpenDoor,
  unlockDoor,
  isDoorUnlocked,
} from './MapRenderer.js';
import {
  renderCafeMap,
  renderCafeRoomLabels,
  renderCafeExitPrompt,
  renderCafeLockedDoorPrompt,
  renderCafeOpenDoorPrompt,
  isSolidCafeAtPixel,
  isNearCafeExit,
  isNearCafeLockedDoor,
  isNearCafeOpenDoor,
  unlockCafeDoor,
  isCafeDoorUnlocked,
  renderCafeNPCs,
  getNearbyNPCCafe,
  markCafeNPCInteracted,
  allCafeNPCsInteracted,
  isCafeNPCInteracted,
} from './Maprenderercafe.js';
import { CAFE_SPAWN, TILE_SIZE_CAFE, CAFE_NPCS } from './maps_cafe.js';
import {
  renderGardenMap,
  renderGardenRoomLabels,
  renderGardenExitPrompt,
  isSolidGardenAtPixel,
  isNearGardenExit,
  getNearbyNPCGarden,
  renderGardenNPCs,
  markGardenNPCInteracted,
} from './MapRendererGarden.js';
import { GARDEN_SPAWN, TILE_SIZE_GARDEN, GARDEN_NPCS } from './maps_garden.js';
import { TILE_SIZE } from '../data/maps.js';
import {
  renderNPCs,
  getNearbyNPC,
  setCurrentInteractingNPC,
  clearCurrentInteractingNPC,
  getCurrentInteractingNPCId,
  npcList,
} from './NPCManager.js';
import DialogEngine from './DialogEngine.js';
import QuestManager from './QuestManager.js';
import SoundManager from './SoundManager.js';
import { loadSprites } from './SpriteManager.js';
import {
  playKeyAnimation,
  updateKeyAnimation,
  renderKeyAnimation,
  isKeyAnimationActive,
} from './Keyanimation.js';

// ============================================
// CANVAS SETUP
// ============================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

// ============================================
// RESIZE CANVAS — FULLSCREEN STRETCH           ← DIUBAH
//
// Sebelumnya: canvas diposisikan dengan letterbox hitam
// di sisi kiri/kanan agar rasio 3:2 terjaga.
//
// Sekarang: canvas mengisi SELURUH layar (width & height 100%).
// Aspect ratio TIDAK dipertahankan — game di-stretch penuh.
// Ini memberikan area bermain maksimal di HP landscape.
//
// Koordinat logis tetap 480x320 — semua kode render
// tidak perlu berubah. ctx.setTransform menangani pemetaan
// dari 480x320 ke ukuran fisik layar yang sebenarnya.
// ============================================

let renderScaleX = 1;
let renderScaleY = 1;

function resizeCanvas() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  // CSS: isi penuh layar
  canvas.style.width = screenW + 'px';
  canvas.style.height = screenH + 'px';
  canvas.style.left = '0px';
  canvas.style.top = '0px';

  // Bitmap fisik = ukuran CSS × DPR (tajam di layar retina)
  canvas.width = Math.round(screenW * dpr);
  canvas.height = Math.round(screenH * dpr);

  // Skala transform: petakan 480x320 logis ke piksel fisik penuh
  // Sumbu X dan Y bisa berbeda (stretch tanpa letterbox)
  renderScaleX = (screenW / GAME_WIDTH) * dpr;
  renderScaleY = (screenH / GAME_HEIGHT) * dpr;

  ctx.setTransform(renderScaleX, 0, 0, renderScaleY, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () =>
  setTimeout(resizeCanvas, 100)
);

// ============================================
// INPUT
// ============================================

export const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  const preventScrollKeys = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    ' ',
  ];
  if (preventScrollKeys.includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

setupDpad(keys);
setupAnalogStick(keys);

// ============================================
// ORIENTATION LOCK PROMPT
// ============================================

const orientationOverlay = document.getElementById('orientation-overlay');

function checkOrientation() {
  if (!orientationOverlay) return;
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isNarrowPortrait =
    window.innerHeight > window.innerWidth && window.innerWidth < 900;

  if (isTouchDevice && isNarrowPortrait) {
    orientationOverlay.classList.remove('hidden');
    GameState._orientationBlocked = true;
  } else {
    orientationOverlay.classList.add('hidden');
    GameState._orientationBlocked = false;
  }
}

checkOrientation();
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () =>
  setTimeout(checkOrientation, 150)
);

// ============================================
// DEBUG PANEL — DINONAKTIFKAN                  ← DIUBAH
//
// Debug panel (FPS / Phase / Keys) disembunyikan
// dari tampilan. Variabel tetap ada agar tidak error
// jika ada kode lain yang masih mereferensikannya,
// tapi updateDebug() tidak menulis ke DOM lagi.
// Untuk mengaktifkan ulang saat development:
//   uncomment baris di dalam updateDebug() di bawah.
// ============================================

// Sembunyikan elemen debug panel via JS (backup selain CSS)
const _debugPanel = document.getElementById('debug-panel');
if (_debugPanel) _debugPanel.style.display = 'none';

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let lastFrameTime = performance.now();

function updateDebug(now) {
  // Debug dinonaktifkan untuk production
  // Uncomment di bawah untuk development:
  // frameCount++;
  // if (now - lastTime >= 500) {
  //   fps = Math.round((frameCount * 1000) / (now - lastTime));
  //   frameCount = 0; lastTime = now;
  // }
  // const debugFps   = document.getElementById('debug-fps');
  // const debugPhase = document.getElementById('debug-phase');
  // const debugKeys  = document.getElementById('debug-keys');
  // if (debugFps)   debugFps.textContent   = `FPS: ${fps}`;
  // if (debugPhase) debugPhase.textContent = `Phase: ${GameState.gamePhase} | Map: ${currentMap}`;
  // if (debugKeys)  debugKeys.textContent  = `Keys: ${Object.keys(keys).filter(k => keys[k]).join(', ') || 'none'}`;
}

// ============================================
// MAP SYSTEM
// ============================================

let currentMap = 'map1';
let _transitioning = false;
let _fadeOverlayAlpha = 0;
let _fadeDir = 0;
let _fadeCallback = null;

let _map1SavedX = -1;
let _map1SavedY = -1;
let _cafeSavedX = -1;
let _cafeSavedY = -1;

function transitionToMap(targetMap) {
  if (_transitioning) return;
  _transitioning = true;
  GameState.gamePhase = 'transition';

  _fadeDir = 1;
  _fadeCallback = () => {
    if (targetMap === 'cafe') {
      _map1SavedX = GameState.player.x;
      _map1SavedY = GameState.player.y;
      GameState.player.x = CAFE_SPAWN.col * TILE_SIZE_CAFE + 4;
      GameState.player.y = CAFE_SPAWN.row * TILE_SIZE_CAFE + 4;
      setCollisionFn(isSolidCafeAtPixel);
      currentMap = 'cafe';
      SoundManager.dialogOpen();
    } else if (targetMap === 'garden') {
      _cafeSavedX = GameState.player.x;
      _cafeSavedY = GameState.player.y;
      GameState.player.x = GARDEN_SPAWN.col * TILE_SIZE_GARDEN + 4;
      GameState.player.y = GARDEN_SPAWN.row * TILE_SIZE_GARDEN + 4;
      setCollisionFn(isSolidGardenAtPixel);
      currentMap = 'garden';
      SoundManager.questNew();
    } else if (targetMap === 'cafe_from_garden') {
      GameState.player.x = _cafeSavedX > 0 ? _cafeSavedX : 384;
      GameState.player.y = _cafeSavedY > 0 ? _cafeSavedY : 256;
      setCollisionFn(isSolidCafeAtPixel);
      currentMap = 'cafe';
      SoundManager.dialogClose();
    } else {
      GameState.player.x = _map1SavedX > 0 ? _map1SavedX : 380;
      GameState.player.y = _map1SavedY > 0 ? _map1SavedY : 256;
      setCollisionFn(null);
      currentMap = 'map1';
      SoundManager.dialogClose();
    }

    _fadeDir = -1;
    _fadeCallback = () => {
      _transitioning = false;
      _fadeOverlayAlpha = 0;
      GameState.gamePhase = 'playing';
      console.log(`[main] Map transition done → ${currentMap}`);
    };
  };
}

// ============================================
// PROXIMITY STATE
// ============================================

let nearbyNPC = null;
let nearLockedDoor = false;
let nearOpenDoor = false;

// ── Café ──
let nearbyCafeNPC = null;
let nearCafeLockedDoor = false;
let nearCafeOpenDoor = false;
let nearCafeExit = false;
let _currentCafeNPCId = null;

// ── Garden ──
let nearbyGardenNPC = null;
let nearGardenExit = false;
let _currentGardenNPCId = null;

// ============================================
// HOOK [1] — DialogEngine._onDialogClose
// ============================================

DialogEngine._onDialogClose = function (dialogId) {
  // ── NPC map 1 ──
  const map1NpcId = getCurrentInteractingNPCId();
  if (map1NpcId) {
    const isMainNPC = npcList.some((npc) => npc.id === map1NpcId);
    if (isMainNPC) {
      GameState.markNPCInteracted(map1NpcId);
    }
    clearCurrentInteractingNPC();
  }

  // ── NPC café (Arya) ──
  if (_currentCafeNPCId) {
    const isCafeNPC = CAFE_NPCS.some((npc) => npc.id === _currentCafeNPCId);
    if (isCafeNPC) {
      markCafeNPCInteracted(_currentCafeNPCId);
      if (allCafeNPCsInteracted() && !isCafeDoorUnlocked()) {
        _onCafeAllNPCsInteracted();
      }
    }
    _currentCafeNPCId = null;
  }

  // ── NPC hewan garden ──
  if (_currentGardenNPCId) {
    const isGardenAnimal = GARDEN_NPCS.some(
      (npc) => npc.id === _currentGardenNPCId
    );
    if (isGardenAnimal) {
      markGardenNPCInteracted(_currentGardenNPCId);
      const npcData = GARDEN_NPCS.find((n) => n.id === _currentGardenNPCId);
      if (npcData?.type === 'cat') {
        setTimeout(() => {
          QuestManager.showNotif(
            '🐱 Elus Kucing!',
            'Dia tidak peduli tapi kamu senang',
            'notif-item'
          );
        }, 300);
      } else if (npcData?.type === 'hamster') {
        setTimeout(() => {
          QuestManager.showNotif(
            '🐹 Peluk Hamster!',
            'Pipinya penuh biji!',
            'notif-item'
          );
        }, 300);
      }
    }
    _currentGardenNPCId = null;
  }
};

// ============================================
// HOOK [2] — GameState._onKeyObtained
// ============================================

GameState._onKeyObtained = function () {
  playKeyAnimation();
  setTimeout(() => {
    QuestManager.showNotif(
      'Item Didapat!',
      '🗝️ Kunci Pintu Berikutnya',
      'notif-item'
    );
    SoundManager.itemGet();
  }, 300);
  setTimeout(() => {
    unlockDoor();
    QuestManager.showNotif(
      '🚪 Pintu Terbuka!',
      'Pergi ke pojok kanan bawah ☕',
      'notif-quest-new'
    );
  }, 1800);
};

// ============================================
// HOOK [3] — Semua NPC Café sudah diajak ngobrol
// ============================================

function _onCafeAllNPCsInteracted() {
  SoundManager.questComplete();
  setTimeout(() => {
    QuestManager.showNotif(
      'Item Didapat!',
      '🗝️ Kunci Ruangan Dalam',
      'notif-item'
    );
  }, 200);
  setTimeout(() => {
    unlockCafeDoor();
    QuestManager.showNotif(
      '🚪 Pintu Terbuka!',
      'Pojok kanan bawah café',
      'notif-quest-new'
    );
  }, 1600);
  GameState.addToInventory({
    id: 'key_cafe_inner',
    name: '🗝️ Kunci Ruangan Dalam',
    type: 'key',
    content:
      'Kunci pintu di pojok kanan bawah café. Arya bilang ada sesuatu di balik pintu itu.',
  });
}

// ============================================
// UPDATE MAP 1
// ============================================

function updateMap1() {
  updatePlayer(keys);

  nearbyNPC = getNearbyNPC(GameState.player.x, GameState.player.y);
  nearLockedDoor = isNearLockedDoor(GameState.player.x, GameState.player.y);
  nearOpenDoor = isNearOpenDoor(GameState.player.x, GameState.player.y);

  if (nearbyNPC && keys['e']) {
    keys['e'] = false;
    setCurrentInteractingNPC(nearbyNPC.id);
    DialogEngine.start(nearbyNPC.dialogId);
    return;
  }
  if (nearLockedDoor && !GameState.hasKey && keys['e']) {
    keys['e'] = false;
    SoundManager.dialogClose();
    return;
  }
  if (nearOpenDoor && isDoorUnlocked() && keys['e']) {
    keys['e'] = false;
    if (!_transitioning && !isKeyAnimationActive()) {
      QuestManager.showNotif('☕ Selamat Datang', 'di Café!', 'notif-item');
      transitionToMap('cafe');
    }
    return;
  }
}

// ============================================
// UPDATE CAFÉ
// ============================================

function updateCafe() {
  updatePlayer(keys);

  nearCafeExit = isNearCafeExit(GameState.player.x, GameState.player.y);
  nearbyCafeNPC = getNearbyNPCCafe(GameState.player.x, GameState.player.y);
  nearCafeLockedDoor = isNearCafeLockedDoor(
    GameState.player.x,
    GameState.player.y
  );
  nearCafeOpenDoor = isNearCafeOpenDoor(GameState.player.x, GameState.player.y);

  if (nearbyCafeNPC && keys['e']) {
    keys['e'] = false;
    _currentCafeNPCId = nearbyCafeNPC.id;
    DialogEngine.start(nearbyCafeNPC.dialogId);
    return;
  }
  if (nearCafeLockedDoor && !isCafeDoorUnlocked() && keys['e']) {
    keys['e'] = false;
    SoundManager.dialogClose();
    return;
  }
  if (nearCafeOpenDoor && isCafeDoorUnlocked() && keys['e']) {
    keys['e'] = false;
    if (!_transitioning) {
      QuestManager.showNotif(
        '🌸 Taman Bunga',
        'Selamat datang di taman!',
        'notif-quest-new'
      );
      transitionToMap('garden');
    }
    return;
  }
  if (nearCafeExit && keys['e']) {
    keys['e'] = false;
    if (!_transitioning) transitionToMap('map1');
    return;
  }
}

// ============================================
// UPDATE GARDEN
// ============================================

function updateGarden() {
  updatePlayer(keys);

  nearGardenExit = isNearGardenExit(GameState.player.x, GameState.player.y);
  nearbyGardenNPC = getNearbyNPCGarden(GameState.player.x, GameState.player.y);

  if (nearbyGardenNPC && keys['e']) {
    keys['e'] = false;
    _currentGardenNPCId = nearbyGardenNPC.id;
    DialogEngine.start(nearbyGardenNPC.dialogId);
    return;
  }
  if (nearGardenExit && keys['e']) {
    keys['e'] = false;
    if (!_transitioning) transitionToMap('cafe_from_garden');
    return;
  }
}

// ============================================
// UPDATE MAIN
// ============================================

function update(now) {
  if (GameState._orientationBlocked) return;

  if (GameState.gamePhase === 'dialog') {
    if (keys[' ']) {
      keys[' '] = false;
      DialogEngine.advance();
    }
    return;
  }

  if (GameState.gamePhase === 'transition') {
    const FADE_SPEED = 0.06;
    _fadeOverlayAlpha += _fadeDir * FADE_SPEED;

    if (_fadeDir === 1 && _fadeOverlayAlpha >= 1) {
      _fadeOverlayAlpha = 1;
      const cb = _fadeCallback;
      _fadeCallback = null;
      _fadeDir = 0;
      if (cb) cb();
    } else if (_fadeDir === -1 && _fadeOverlayAlpha <= 0) {
      _fadeOverlayAlpha = 0;
      const cb = _fadeCallback;
      _fadeCallback = null;
      _fadeDir = 0;
      if (cb) cb();
    }
    return;
  }

  if (GameState.gamePhase !== 'playing') return;

  if (currentMap === 'map1') updateMap1();
  else if (currentMap === 'cafe') updateCafe();
  else if (currentMap === 'garden') updateGarden();
}

// ============================================
// RENDER MAP 1
// ============================================

function renderMap1() {
  renderMap(ctx);
  renderRoomLabels(ctx);
  renderNPCs(ctx, nearbyNPC);
  renderPlayer(ctx);
  if (nearLockedDoor) renderLockedDoorPrompt(ctx, GameState.hasKey);
  if (nearOpenDoor) renderOpenDoorPrompt(ctx);
  renderKeyAnimation(ctx);
}

// ============================================
// RENDER CAFÉ
// ============================================

function renderCafe() {
  renderCafeMap(ctx);
  renderCafeRoomLabels(ctx);
  renderCafeNPCs(ctx, nearbyCafeNPC);
  renderPlayer(ctx);
  if (nearCafeExit) renderCafeExitPrompt(ctx);
  if (nearCafeLockedDoor) {
    renderCafeLockedDoorPrompt(ctx, isCafeNPCInteracted('cafe_npc_arya'));
  }
  if (nearCafeOpenDoor) renderCafeOpenDoorPrompt(ctx);
}

// ============================================
// RENDER GARDEN
// ============================================

function renderGarden() {
  renderGardenMap(ctx);
  renderGardenRoomLabels(ctx);
  renderGardenNPCs(ctx, nearbyGardenNPC);
  renderPlayer(ctx);
  if (nearGardenExit) renderGardenExitPrompt(ctx);
}

// ============================================
// RENDER FADE OVERLAY
// ============================================

function renderFadeOverlay() {
  if (_fadeOverlayAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = _fadeOverlayAlpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.restore();
}

// ============================================
// RENDER MAIN
// ============================================

function render(now) {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  if (currentMap === 'map1') renderMap1();
  else if (currentMap === 'cafe') renderCafe();
  else if (currentMap === 'garden') renderGarden();
  renderFadeOverlay();
}

// ============================================
// GAME LOOP
// ============================================

function loop(now) {
  const deltaMs = now - lastFrameTime;
  lastFrameTime = now;
  updateDebug(now);
  update(now);
  updateKeyAnimation(deltaMs);
  render(now);
  requestAnimationFrame(loop);
}

// ============================================
// INIT
// ============================================

async function init() {
  try {
    await loadSprites();
    requestAnimationFrame(loop);
    console.log('[BirthdayQuest] Init complete ✓');
  } catch (err) {
    console.error('[BirthdayQuest] Init FAILED:', err);
    requestAnimationFrame(loop);
  }
}

// ============================================
// LOGIN GATE
// ============================================

window.addEventListener(
  'gameUnlocked',
  function onGameUnlocked() {
    window.removeEventListener('gameUnlocked', onGameUnlocked);
    console.log('[BirthdayQuest] Login sukses — memulai game...');
    init();
  },
  { once: true }
);

console.log('[BirthdayQuest] Menunggu login...');
