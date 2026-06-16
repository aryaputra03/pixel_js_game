// ============================================
// KeyAnimation.js — Animasi Kunci Ditemukan
// Birthday Quest RPG
//
// Tampilkan animasi kunci di tengah layar:
//   1. Kunci muncul dari bawah (slide + scale up)
//   2. Bergetar / berputar sebentar
//   3. Bergerak ke pojok kiri atas (ke arah inventory/HUD)
//   4. Menghilang (fade out + scale down)
//
// Dirender via canvas 2D — tidak pakai DOM element
// agar konsisten dengan rendering pipeline game.
//
// Dipanggil dari main.js saat GameState._onKeyObtained() dipanggil.
// ============================================

// ============================================
// ANIMATION STATE
// ============================================

/**
 * State animasi kunci.
 * Semua nilai dalam koordinat canvas (480x320).
 */
const state = {
  active: false, // apakah animasi sedang berjalan
  phase: 'idle', // 'rise' | 'hold' | 'fly' | 'done'
  t: 0, // timer dalam ms sejak fase dimulai

  // Posisi kunci (center)
  x: 240, // mulai tengah canvas
  y: 160,

  // Target akhir (pojok HUD kiri atas ≈ tempat inventory)
  targetX: 20,
  targetY: 20,

  alpha: 0, // opacity 0-1
  scale: 0, // scale 0-1.5
  rotation: 0, // rotasi dalam radian
};

// Durasi tiap fase (ms)
const PHASE = {
  rise: 400, // kunci naik ke tengah
  hold: 800, // diam sebentar, bergetar
  fly: 600, // terbang ke pojok HUD
};

// ============================================
// PUBLIC API
// ============================================

/**
 * playKeyAnimation()
 * Mulai animasi kunci.
 * Safe untuk dipanggil kapan saja — jika sudah aktif, restart.
 */
export function playKeyAnimation() {
  state.active = true;
  state.phase = 'rise';
  state.t = 0;
  state.x = 240; // tengah canvas
  state.y = 200; // mulai sedikit di bawah tengah
  state.alpha = 0;
  state.scale = 0;
  state.rotation = 0;
  console.log('[KeyAnimation] Started');
}

/**
 * isKeyAnimationActive()
 * Return true selama animasi masih berjalan.
 * Dipakai main.js untuk skip logika lain selama animasi.
 */
export function isKeyAnimationActive() {
  return state.active;
}

// ============================================
// UPDATE — dipanggil tiap frame dari game loop
// ============================================

/**
 * updateKeyAnimation(deltaMs)
 * Update state animasi berdasarkan waktu yang berlalu.
 *
 * @param {number} deltaMs - ms sejak frame terakhir
 */
export function updateKeyAnimation(deltaMs) {
  if (!state.active) return;

  state.t += deltaMs;

  switch (state.phase) {
    // ── FASE 1: RISE ──
    // Kunci muncul dari bawah layar, scale & fade in
    case 'rise': {
      const progress = Math.min(state.t / PHASE.rise, 1);
      const ease = easeOutBack(progress); // overshoot sedikit — feel RPG

      state.y = 200 - ease * 40; // naik 40px
      state.alpha = ease;
      state.scale = ease * 1.2; // sedikit lebih besar dulu (pop)
      state.rotation = (1 - ease) * Math.PI * 0.5; // sedikit rotate saat muncul

      if (progress >= 1) {
        state.phase = 'hold';
        state.t = 0;
        state.y = 160; // posisi tengah final
        state.alpha = 1;
        state.scale = 1;
        state.rotation = 0;
      }
      break;
    }

    // ── FASE 2: HOLD ──
    // Kunci diam di tengah, sedikit bergoyang (bounce)
    case 'hold': {
      const progress = Math.min(state.t / PHASE.hold, 1);

      // Bergoyang naik-turun
      state.y = 160 + Math.sin(state.t / 120) * 3;
      // Sedikit rotasi bolak-balik
      state.rotation = Math.sin(state.t / 150) * 0.08;
      state.scale = 1 + Math.sin(state.t / 200) * 0.03; // "breathing"
      state.alpha = 1;

      if (progress >= 1) {
        state.phase = 'fly';
        state.t = 0;
      }
      break;
    }

    // ── FASE 3: FLY ──
    // Kunci terbang ke pojok kiri atas (HUD area), fade out
    case 'fly': {
      const progress = Math.min(state.t / PHASE.fly, 1);
      const ease = easeInQuad(progress);

      // Interpolasi posisi ke target
      const startX = 240,
        startY = 160;
      state.x = lerp(startX, state.targetX, ease);
      state.y = lerp(startY, state.targetY, ease);
      state.scale = lerp(1, 0.3, ease); // mengecil saat menjauh
      state.alpha = lerp(1, 0, ease); // fade out

      if (progress >= 1) {
        state.active = false;
        state.phase = 'done';
        console.log('[KeyAnimation] Done');
      }
      break;
    }
  }
}

// ============================================
// RENDER — dipanggil tiap frame dari game loop
// ============================================

/**
 * renderKeyAnimation(ctx)
 * Gambar kunci di canvas menggunakan state saat ini.
 * Dipanggil SETELAH renderMap & renderNPCs, SEBELUM renderPlayer.
 * (Atau bisa juga setelah player — terserah priority-nya)
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderKeyAnimation(ctx) {
  if (!state.active) return;

  ctx.save();

  // Transformasi: translate ke posisi kunci, rotate, scale
  ctx.translate(state.x, state.y);
  ctx.rotate(state.rotation);
  ctx.scale(state.scale, state.scale);
  ctx.globalAlpha = state.alpha;

  // ── Background glow ──
  const glowR = 20;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
  grad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
  grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  // ── Kunci pixel art (32x32 centered at 0,0) ──
  drawKeyPixelArt(ctx);

  // ── Label teks ──
  ctx.fillStyle = '#FFE066';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText('KUNCI DIDAPAT!', 0, 22);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ============================================
// PIXEL ART KUNCI
// ============================================

/**
 * drawKeyPixelArt(ctx)
 * Gambar ikon kunci 16x16 pixel, di-center di (0,0).
 * Diperbesar 2x → efektif 32x32 di layar.
 *
 * Layout:
 *    ○○     ← head kunci (lingkaran)
 *   ○  ○
 *    ○○
 *     │
 *     │──   ← shaft kunci
 *     │ │
 *     └─┘   ← tooth bawah
 */
function drawKeyPixelArt(ctx) {
  const S = 2; // scale tiap pixel (2px per pixel-art-pixel)
  const ox = -8; // offset X agar center di 0
  const oy = -8; // offset Y

  // Warna kunci
  const GOLD = '#FFD700';
  const GOLD2 = '#FFA500';
  const SHINE = '#FFEF8A';
  const SHADOW = '#8B6914';

  // Helper — gambar satu pixel art pixel
  const p = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x * S, oy + y * S, S, S);
  };

  // Head kunci
  p(5, 0, GOLD);
  p(6, 0, GOLD);
  p(4, 1, GOLD);
  p(5, 1, SHINE);
  p(6, 1, GOLD);
  p(7, 1, GOLD);
  p(4, 2, GOLD);
  p(5, 2, GOLD);
  p(6, 2, GOLD);
  p(7, 2, GOLD);
  p(4, 3, GOLD2);
  p(5, 3, GOLD);
  p(6, 3, GOLD);
  p(7, 3, GOLD2);
  p(5, 4, SHADOW);
  p(6, 4, SHADOW);

  // Shaft
  p(6, 4, GOLD);
  p(6, 5, GOLD);
  p(7, 5, GOLD2);
  p(6, 6, GOLD);
  p(6, 7, GOLD);
  p(6, 8, GOLD);

  // Teeth bawah
  p(6, 9, GOLD);
  p(7, 9, GOLD2);
  p(6, 10, GOLD);
  p(6, 11, GOLD);
  p(7, 11, GOLD2);
}

// ============================================
// EASING FUNCTIONS
// ============================================

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInQuad(t) {
  return t * t;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
