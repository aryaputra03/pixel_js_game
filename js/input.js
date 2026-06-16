// ============================================
// input.js - Touch & D-pad Input Handler
// Birthday Quest RPG
//
// Dipisah dari main.js agar main.js tetap bersih.
// Semua logic touch ada di sini.
// ============================================

/**
 * setupDpad(keys)
 *
 * Menghubungkan tombol virtual D-pad (HTML button)
 * ke objek keys yang sama dengan keyboard listener.
 *
 * Hasilnya: game loop tidak perlu tahu input dari mana -
 * keys['ArrowRight'] true bisa dari keyboard ATAU d-pad.
 *
 * @param {Object} keys - objek keyboard state dari main.js
 */
export function setupDpad(keys) {
  const dpadContainer = document.getElementById('dpad-container');
  const buttons = document.querySelectorAll('.dpad-btn, .action-btn');

  // Cek apakah device touch - tampilkan d-pad jika iya
  // CSS @media sudah handle sebagian, JS ini sebagai backup
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    dpadContainer.style.display = 'flex';
  }

  /**
   * Pasang event listener di setiap tombol D-pad.
   *
   * Pakai touchstart/touchend bukan click:
   * - click punya delay 300ms di mobile
   * - touchstart/touchend langsung, tidak ada delay
   *
   * pointer events (pointerdown/pointerup) lebih modern
   * dan handle both mouse + touch sekaligus.
   */
  buttons.forEach((btn) => {
    const key = btn.dataset.key;
    if (!key) return;

    // Tombol ditekan
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // cegah scroll & zoom saat tekan tombol
      keys[key] = true;
      btn.classList.add('pressed'); // visual feedback
    });

    // Tombol dilepas
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      keys[key] = false;
      btn.classList.remove('pressed');
    });

    // Handle kasus jari keluar dari tombol tanpa lepas
    btn.addEventListener('pointerleave', () => {
      keys[key] = false;
      btn.classList.remove('pressed');
    });

    // Safeguard: kalau pointer cancel (interupsi OS, notif, dll)
    btn.addEventListener('pointercancel', () => {
      keys[key] = false;
      btn.classList.remove('pressed');
    });
  });

  /**
   * MULTI-TOUCH SUPPORT
   *
   * Masalah umum: jika jari kiri sudah tekan ArrowLeft,
   * jari kanan tekan ArrowUp - salah satu tombol akan
   * kehilangan event karena pointer ID berubah.
   *
   * Solusi: track semua active touches via Set,
   * bersihkan semua keys saat semua jari terangkat.
   */
  const activeTouches = new Set();

  dpadContainer.addEventListener(
    'touchstart',
    (e) => {
      for (const touch of e.changedTouches) {
        activeTouches.add(touch.identifier);
      }
    },
    { passive: true }
  );

  dpadContainer.addEventListener(
    'touchend',
    (e) => {
      for (const touch of e.changedTouches) {
        activeTouches.delete(touch.identifier);
      }

      // Jika semua jari sudah lepas dari d-pad area,
      // pastikan semua key direction ter-release
      if (activeTouches.size === 0) {
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach((k) => {
          keys[k] = false;
        });
      }
    },
    { passive: true }
  );

  console.log('[Input] D-pad setup OK | Touch device:', isTouchDevice);
}

// ============================================
// ANALOG STICK - virtual joystick mobile (BARU)
//
// Alternatif d-pad bertombol: stick tunggal yang bisa
// di-drag bebas 360 derajat, lebih natural & cepat untuk
// gerakan diagonal dibanding 4 tombol terpisah.
//
// Cara kerja:
//   1. Pemain sentuh area stick (#analog-stick)
//   2. Knob (#analog-knob) ikut jari, dibatasi radius maksimal
//   3. Sudut & jarak drag dikonversi ke keys['ArrowUp'/Down/Left/Right']
//      dengan threshold sudut per arah (mendukung diagonal
//      otomatis lewat kombinasi 2 arah sekaligus)
//   4. Lepas jari -> knob balik ke tengah, semua arah di-reset
//
// Tetap menulis ke objek `keys` yang sama dengan keyboard,
// supaya game loop & updatePlayer() tidak perlu tahu sumber input.
// ============================================
export function setupAnalogStick(keys) {
  const stickBase = document.getElementById('analog-stick');
  const knob = document.getElementById('analog-knob');
  if (!stickBase || !knob) {
    console.warn('[Input] Analog stick element tidak ditemukan, skip setup.');
    return;
  }

  const MAX_RADIUS = 30; // px - jarak maksimal knob dari pusat (sebelum di-clamp)
  let activePointerId = null;
  let baseRect = null;

  const DIRS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  function resetDirections() {
    DIRS.forEach((d) => {
      keys[d] = false;
    });
  }

  function setKnobPosition(dx, dy) {
    knob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
  }

  function updateDirectionsFromVector(dx, dy) {
    // Deadzone kecil di tengah agar tidak ada gerakan tak sengaja
    const DEADZONE = 6;
    const dist = Math.sqrt(dx * dx + dy * dy);

    resetDirections();
    if (dist < DEADZONE) return;

    // Normalisasi sudut, lalu tentukan arah aktif.
    // Memakai perbandingan komponen (bukan hanya 4 sektor kaku)
    // supaya gerakan diagonal otomatis menyalakan 2 arah sekaligus
    // (misal drag ke kanan-bawah -> ArrowRight + ArrowDown aktif).
    const angle = Math.atan2(dy, dx); // -PI..PI
    const deg = angle * (180 / Math.PI);

    // Kanan: -67.5..67.5 | Bawah: 22.5..157.5 | dst - overlap sengaja
    // dibuat lebar (135 derajat per arah, bukan 90) agar diagonal mudah ke-trigger.
    if (deg > -135 && deg < -22.5) keys['ArrowUp'] = true;
    if (deg > 22.5 && deg < 135) keys['ArrowDown'] = true;
    if (deg > -67.5 && deg < 67.5) keys['ArrowRight'] = true;
    if (deg > 112.5 || deg < -112.5) keys['ArrowLeft'] = true;
  }

  function handleStart(e) {
    if (activePointerId !== null) return; // sudah ada touch aktif, ignore
    activePointerId = e.pointerId;
    baseRect = stickBase.getBoundingClientRect();
    stickBase.classList.add('active');
    handleMove(e);
  }

  function handleMove(e) {
    if (e.pointerId !== activePointerId || !baseRect) return;
    e.preventDefault();

    const cx = baseRect.left + baseRect.width / 2;
    const cy = baseRect.top + baseRect.height / 2;

    let dx = e.clientX - cx;
    let dy = e.clientY - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) {
      const ratio = MAX_RADIUS / dist;
      dx *= ratio;
      dy *= ratio;
    }

    setKnobPosition(dx, dy);
    updateDirectionsFromVector(dx, dy);
  }

  function handleEnd(e) {
    if (e.pointerId !== activePointerId) return;
    activePointerId = null;
    baseRect = null;
    stickBase.classList.remove('active');
    setKnobPosition(0, 0);
    resetDirections();
  }

  stickBase.addEventListener('pointerdown', handleStart);
  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleEnd);
  window.addEventListener('pointercancel', handleEnd);

  console.log('[Input] Analog stick setup OK');
}
