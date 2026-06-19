// ============================================
// SoundManager.js — Procedural 8-bit Sound FX
// Birthday Quest RPG · Tahap 9
//
// Semua SFX di-generate via Web Audio API —
// tidak perlu file audio sama sekali.
// AudioContext dibuat lazy (saat pertama dipakai)
// karena browser butuh user gesture dulu.
// ============================================

let audioCtx = null;

/**
 * getCtx()
 * Lazy-init AudioContext.
 * Browser modern blokir AudioContext sebelum ada interaksi user.
 */
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume jika suspended (mobile sering suspend)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ============================================
// PRIMITIVE — building block semua SFX
// ============================================

/**
 * playTone(freq, dur, type, vol, delay)
 * Buat satu nada dengan oscillator.
 *
 * @param {number} freq   - frekuensi Hz
 * @param {number} dur    - durasi detik
 * @param {string} type   - 'square'|'sine'|'triangle'|'sawtooth'
 * @param {number} vol    - volume 0-1 (default 0.3)
 * @param {number} delay  - delay sebelum mulai (detik, default 0)
 */
function playTone(freq, dur, type = 'square', vol = 0.3, delay = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Envelope: attack cepat, release sedikit agar tidak "klik"
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.005);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.01);
  } catch (e) {
    // Fail silently — sound bukan fitur kritis
  }
}

// ============================================
// SFX LIBRARY
// ============================================

const SoundManager = {
  /**
   * typewriterTick()
   * Suara klik ringan saat typewriter mengetik satu karakter.
   * Dipanggil tiap 3-4 karakter (tidak tiap karakter — terlalu berisik).
   */
  typewriterTick() {
    // Noise pendek via triangle — lebih lembut dari square
    playTone(800 + Math.random() * 200, 0.025, 'triangle', 0.08);
  },

  /**
   * dialogOpen()
   * Suara saat dialog box slide-in muncul.
   * Dua nada naik cepat — feel "pop up".
   */
  dialogOpen() {
    playTone(300, 0.06, 'square', 0.2, 0);
    playTone(500, 0.08, 'square', 0.2, 0.05);
  },

  /**
   * dialogAdvance()
   * Suara saat player tekan Spasi/OK untuk lanjut dialog.
   * Satu klik pendek.
   */
  dialogAdvance() {
    playTone(440, 0.04, 'square', 0.15);
  },

  /**
   * dialogClose()
   * Suara saat dialog box tutup.
   * Dua nada turun.
   */
  dialogClose() {
    playTone(500, 0.06, 'square', 0.15, 0);
    playTone(300, 0.08, 'square', 0.15, 0.05);
  },

  /**
   * questNew()
   // Fanfare kecil saat quest baru dimulai.
   * Tiga nada naik — feel "ting ting ting!".
   */
  questNew() {
    playTone(523, 0.1, 'square', 0.25, 0); // C5
    playTone(659, 0.1, 'square', 0.25, 0.1); // E5
    playTone(784, 0.2, 'square', 0.25, 0.2); // G5
  },

  /**
   * questComplete()
   * Fanfare lebih besar saat quest selesai.
   * Arpeggio naik + nada panjang di akhir.
   */
  questComplete() {
    playTone(523, 0.08, 'square', 0.3, 0); // C5
    playTone(659, 0.08, 'square', 0.3, 0.08); // E5
    playTone(784, 0.08, 'square', 0.3, 0.16); // G5
    playTone(1047, 0.25, 'square', 0.3, 0.24); // C6 — nada panjang
  },

  /**
   * itemGet()
   * Suara dapat item — klasik RPG.
   * Dua nada pendek naik.
   */
  itemGet() {
    playTone(698, 0.08, 'triangle', 0.25, 0);
    playTone(880, 0.15, 'triangle', 0.25, 0.08);
  },

  /**
   * playerStep()
   * Suara langkah kaki — sangat pelan agar tidak mengganggu.
   * Dipanggil setiap ~16 frame saat player bergerak.
   */
  playerStep() {
    playTone(120, 0.04, 'sawtooth', 0.06);
  },

  /**
   * interact()
   * Suara saat player menekan E untuk interaksi NPC.
   */
  interact() {
    playTone(600, 0.05, 'square', 0.2);
  },

  /**
   * ending()
   * Musik sederhana untuk ending cutscene.
   * Melodi pendek yang agak emosional.
   */
  ending() {
    // Melodi sederhana — C major, feel hopeful
    const notes = [
      [523, 0], // C5
      [587, 0.2], // D5
      [659, 0.4], // E5
      [698, 0.6], // F5
      [784, 0.8], // G5
      [659, 1.1], // E5
      [784, 1.4], // G5
      [1047, 1.7], // C6 — resolusi
    ];
    notes.forEach(([freq, delay]) => {
      playTone(freq, 0.18, 'triangle', 0.2, delay);
    });
  },

  /**
   * npcNearby()
   * Suara pendek saat NPC pertama kali terdeteksi dalam jangkauan.
   * Hanya dipanggil saat transisi null → ada NPC (bukan tiap frame).
   */
  npcNearby() {
    playTone(880, 0.04, 'sine', 0.12);
  },

  // ============================================
  // BIRTHDAY MUSIC — file audio custom dari assets/
  //
  // Berbeda dari SFX di atas (yang procedural via Web Audio API),
  // musik ulang tahun pakai elemen <audio> HTML karena ini file
  // audio asli (mp3/wav), bukan nada yang di-generate.
  //
  // Cara pakai:
  //   1. Taruh file audio di: assets/sounds/birthday.mp3
  //      (boleh ganti nama file & path, sesuaikan BIRTHDAY_MUSIC_SRC)
  //   2. playBirthdayMusic() dipanggil sekali saat masuk map café
  //   3. stopBirthdayMusic() dipanggil saat keluar dari café
  // ============================================

  _birthdayAudio: null,

  /**
   * playBirthdayMusic()
   * Mainkan musik ulang tahun, loop selama player ada di café.
   * Lazy-load elemen audio agar tidak fetch file sebelum dibutuhkan.
   */
  playBirthdayMusic() {
    try {
      if (!this._birthdayAudio) {
        this._birthdayAudio = new Audio(BIRTHDAY_MUSIC_SRC);
        this._birthdayAudio.loop = true;
        this._birthdayAudio.volume = 0.5;
      }
      // Reset ke awal setiap kali masuk café (feel seperti "disambut")
      this._birthdayAudio.currentTime = 0;
      const playPromise = this._birthdayAudio.play();
      if (playPromise) {
        playPromise.catch((err) => {
          // Browser kadang blokir autoplay tanpa gesture — aman diabaikan
          console.warn('[SoundManager] Birthday music blocked:', err.message);
        });
      }
    } catch (e) {
      console.warn('[SoundManager] Birthday music failed to load:', e);
    }
  },

  /**
   * stopBirthdayMusic()
   * Hentikan musik ulang tahun — dipanggil saat player keluar café.
   * Fade out singkat agar tidak terasa "putus" tiba-tiba.
   */
  stopBirthdayMusic() {
    if (!this._birthdayAudio) return;
    const audio = this._birthdayAudio;
    const fadeStep = 0.05;
    const fadeInterval = setInterval(() => {
      if (audio.volume > fadeStep) {
        audio.volume -= fadeStep;
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.5; // reset volume untuk pemutaran berikutnya
        clearInterval(fadeInterval);
      }
    }, 40);
  },
};

// ============================================
// PATH FILE MUSIK ULANG TAHUN
// Ganti path ini sesuai nama file yang kamu taruh di assets/sounds/
// ============================================

const BIRTHDAY_MUSIC_SRC = '/song.mp3';

export default SoundManager;
