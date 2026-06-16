// ============================================
// main.js — Entry point & Game Loop
// Birthday Quest RPG
//
// Perubahan dari versi sebelumnya:
//
// [GARDEN NPC — Kucing & Hamster]
//   - Import getNearbyNPCGarden, renderGardenNPCs,
//     markGardenNPCInteracted dari MapRendererGarden
//   - Import GARDEN_NPCS dari maps_garden
//   - nearbyGardenNPC: tracking hewan NPC terdekat di taman
//   - _currentGardenNPCId: tracking NPC hewan yang sedang diajak ngobrol
//   - DialogEngine._onDialogClose: extended untuk handle NPC taman
//   - updateGarden(): extended dengan NPC animal interaction
//   - renderGarden(): extended dengan renderGardenNPCs
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
  getNearbyNPCGarden, // ← BARU
  renderGardenNPCs, // ← BARU
  markGardenNPCInteracted, // ← BARU
} from './MapRendererGarden.js';
import { GARDEN_SPAWN, TILE_SIZE_GARDEN, GARDEN_NPCS } from './maps_garden.js'; // ← GARDEN_NPCS BARU
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
} from './KeyAnimation.js';

// ============================================
// CANVAS SETUP
// ============================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

// ============================================
// RESIZE CANVAS — DPR-AWARE (anti-blur)        ← DIPERBAIKI
//
// Masalah sebelumnya: canvas.width/height di-set sama dengan
// GAME_WIDTH/GAME_HEIGHT (480x320), lalu di-stretch lewat CSS
// ke ukuran layar HP yang jauh lebih besar (misal 800x533px).
// Browser men-scale bitmap 480x320 itu dengan interpolasi →
// semua teks pixel-art jadi BURAM (lihat screenshot bug).
//
// Solusi: render di resolusi piksel fisik layar
// (CSS size × devicePixelRatio), lalu pakai ctx.setTransform()
// supaya kode gambar (renderMap, drawNPC, dst) TETAP
// berpikir dalam koordinat logis 480x320 seperti biasa.
// Hasilnya: tajam di semua device, termasuk HP retina/AMOLED.
// ============================================

let renderScale = 1; // skala logis→fisik saat ini

function resizeCanvas() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const scale = Math.min(screenW / GAME_WIDTH, screenH / GAME_HEIGHT);
  const scaledW = Math.floor(GAME_WIDTH * scale);
  const scaledH = Math.floor(GAME_HEIGHT * scale);

  // Ukuran tampilan (CSS) — tetap seperti sebelumnya
  canvas.style.width = scaledW + 'px';
  canvas.style.height = scaledH + 'px';
  canvas.style.left = Math.floor((screenW - scaledW) / 2) + 'px';
  canvas.style.top = Math.floor((screenH - scaledH) / 2) + 'px';

  // ── KUNCI PERBAIKAN ──
  // devicePixelRatio: 1 di monitor biasa, 2-3 di HP modern.
  // Tanpa ini, browser merender 480x320 lalu di-blur-stretch ke ukuran fisik.
  const dpr = window.devicePixelRatio || 1;

  // Resolusi BITMAP aktual = ukuran tampilan × dpr.
  // Ini yang membuat teks & garis tipis tetap tajam di semua device.
  canvas.width = Math.round(scaledW * dpr);
  canvas.height = Math.round(scaledH * dpr);

  // Skala konteks gambar supaya 1 unit kode = 1 unit logis game (480x320),
  // browser yang urus pemetaan ke piksel fisik yang lebih padat.
  renderScale = (scaledW / GAME_WIDTH) * dpr;
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);

  // Pixel art tetap kotak-kotak tegas, tidak di-smooth/blur oleh browser
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
setupAnalogStick(keys); // ← BARU: virtual analog stick untuk mobile

// ============================================
// ORIENTATION LOCK PROMPT — "Putar HP-mu"      ← BARU
//
// Game ini didesain landscape (480x320 = rasio lebar).
// Di HP portrait, layar jadi sangat kecil & kontrol sempit.
// Overlay ini menyuruh pemain memutar HP ke landscape,
// dan otomatis hilang begitu orientasi berubah.
// Tidak aktif di desktop (mouse/keyboard) — hanya device
// dengan ukuran layar sempit (mobile/tablet).
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
    // Pause logic ringan: jangan update game saat overlay tampil
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
// DEBUG PANEL
// ============================================

const debugFps = document.getElementById('debug-fps');
const debugPhase = document.getElementById('debug-phase');
const debugKeys = document.getElementById('debug-keys');

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let lastFrameTime = performance.now();

function updateDebug(now) {
  frameCount++;
  if (now - lastTime >= 500) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
  }
  debugFps.textContent = `FPS: ${fps}`;
  debugPhase.textContent = `Phase: ${GameState.gamePhase} | Map: ${currentMap}`;
  debugKeys.textContent = `Keys: ${
    Object.keys(keys)
      .filter((k) => keys[k])
      .join(', ') || 'none'
  }`;
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

// ── Garden ──                                             ← BARU
let nearbyGardenNPC = null; // NPC hewan terdekat di taman
let nearGardenExit = false;
let _currentGardenNPCId = null; // NPC hewan yang sedang diajak ngobrol

// ============================================
// HOOK [1] — DialogEngine._onDialogClose
// Extended: handle NPC map1, café, dan garden
// ============================================

DialogEngine._onDialogClose = function (dialogId) {
  // ── NPC map 1 ──
  const map1NpcId = getCurrentInteractingNPCId();
  if (map1NpcId) {
    const isMainNPC = npcList.some((npc) => npc.id === map1NpcId);
    if (isMainNPC) {
      GameState.markNPCInteracted(map1NpcId);
      console.log(`[main] Map1 NPC dialog closed: ${map1NpcId}`);
    }
    clearCurrentInteractingNPC();
  }

  // ── NPC café (Arya) ──
  if (_currentCafeNPCId) {
    const isCafeNPC = CAFE_NPCS.some((npc) => npc.id === _currentCafeNPCId);
    if (isCafeNPC) {
      markCafeNPCInteracted(_currentCafeNPCId);
      console.log(`[main] Café NPC dialog closed: ${_currentCafeNPCId}`);
      if (allCafeNPCsInteracted() && !isCafeDoorUnlocked()) {
        _onCafeAllNPCsInteracted();
      }
    }
    _currentCafeNPCId = null;
  }

  // ── NPC hewan garden ──                                ← BARU
  if (_currentGardenNPCId) {
    const isGardenAnimal = GARDEN_NPCS.some(
      (npc) => npc.id === _currentGardenNPCId
    );
    if (isGardenAnimal) {
      markGardenNPCInteracted(_currentGardenNPCId);
      console.log(`[main] Garden NPC dialog closed: ${_currentGardenNPCId}`);

      // Notif lucu setelah menyapa hewan
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
// HOOK [2] — GameState._onKeyObtained (Map 1)
// ============================================

GameState._onKeyObtained = function () {
  console.log('[main] Key obtained! Triggering animation & unlock...');
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
    console.log('[main] Map1 door visually unlocked.');
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
  console.log('[main] All café NPCs interacted! Unlocking café door...');
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
    if (!_transitioning) {
      transitionToMap('map1');
    }
    return;
  }
}

// ============================================
// UPDATE GARDEN — extended dengan NPC hewan   ← BARU
// ============================================

function updateGarden() {
  updatePlayer(keys);

  nearGardenExit = isNearGardenExit(GameState.player.x, GameState.player.y);

  // Update proximity NPC hewan                            ← BARU
  nearbyGardenNPC = getNearbyNPCGarden(GameState.player.x, GameState.player.y);

  // ── Interaksi NPC hewan ──                             ← BARU
  // Prioritas: cek NPC dulu sebelum pintu keluar
  // agar tidak konflik jika keduanya overlap
  if (nearbyGardenNPC && keys['e']) {
    keys['e'] = false;
    _currentGardenNPCId = nearbyGardenNPC.id;
    DialogEngine.start(nearbyGardenNPC.dialogId);
    return;
  }

  // ── Pintu keluar taman ──
  if (nearGardenExit && keys['e']) {
    keys['e'] = false;
    if (!_transitioning) {
      console.log('[main] Leaving garden → back to café');
      transitionToMap('cafe_from_garden');
    }
    return;
  }
}

// ============================================
// UPDATE MAIN
// ============================================

function update(now) {
  // ── Blokir update saat overlay "putar HP" tampil ──   ← BARU
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
    const aryaInteracted = isCafeNPCInteracted('cafe_npc_arya');
    renderCafeLockedDoorPrompt(ctx, aryaInteracted);
  }
  if (nearCafeOpenDoor) renderCafeOpenDoorPrompt(ctx);
}

// ============================================
// RENDER GARDEN — extended dengan NPC hewan   ← BARU
// ============================================

function renderGarden() {
  renderGardenMap(ctx);
  renderGardenRoomLabels(ctx);

  // Render NPC hewan (di antara map dan player
  // agar player bisa berjalan "di depan" hewan)
  renderGardenNPCs(ctx, nearbyGardenNPC); // ← BARU

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
init();

console.log(
  '[BirthdayQuest] Tahap X+1: Café map + NPC Arya + locked door aktif ✓'
);
console.log(
  '[BirthdayQuest] Tahap X+2: Garden map + NPC Kucing & Hamster aktif ✓'
);
