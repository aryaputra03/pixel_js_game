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
    const ctx  = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type           = type;
    osc.frequency.value = freq;

    // Envelope: attack cepat, release sedikit agar tidak "klik"
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.005);
    gain.gain.linearRampToValueAtTime(0,   ctx.currentTime + delay + dur);

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
    playTone(523, 0.1, 'square', 0.25, 0);     // C5
    playTone(659, 0.1, 'square', 0.25, 0.1);   // E5
    playTone(784, 0.2, 'square', 0.25, 0.2);   // G5
  },

  /**
   * questComplete()
   * Fanfare lebih besar saat quest selesai.
   * Arpeggio naik + nada panjang di akhir.
   */
  questComplete() {
    playTone(523, 0.08, 'square', 0.3, 0);     // C5
    playTone(659, 0.08, 'square', 0.3, 0.08);  // E5
    playTone(784, 0.08, 'square', 0.3, 0.16);  // G5
    playTone(1047,0.25, 'square', 0.3, 0.24);  // C6 — nada panjang
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
      [523, 0],    // C5
      [587, 0.2],  // D5
      [659, 0.4],  // E5
      [698, 0.6],  // F5
      [784, 0.8],  // G5
      [659, 1.1],  // E5
      [784, 1.4],  // G5
      [1047,1.7],  // C6 — resolusi
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

};

export default SoundManager;