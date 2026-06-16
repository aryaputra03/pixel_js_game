// ============================================
// quests.js — Quest Definitions
// Birthday Quest RPG · Tahap 8: Konten Personal
//
// ⚠️  PANDUAN PENGISIAN:
// Ganti semua teks di dalam tanda kutip yang
// bertanda [ISI: ...] dengan konten personalmu.
// Jangan ubah struktur objek JS-nya.
// ============================================

export const QUEST_DATA = {

  // ════════════════════════════════════════
  // QUEST 1 — Quest pembuka, ringan & lucu
  // Trigger: dialog NPC pertama selesai
  // ════════════════════════════════════════
  quest_01: {
    id:    'quest_01',

    // [ISI: judul quest yang lucu, bisa referensi inside joke]
    // Contoh: 'Operasi Temukan Kopi', 'Misi: Cari Parkiran'
    title: 'Misi: [JUDUL QUEST 1]',

    // [ISI: deskripsi singkat misi — bisa roast halus]
    desc:  '[Deskripsi quest 1 — boleh lucu]',

    total: 1,   // 1 = selesai setelah 1x updateQuest dipanggil

    reward: {
      id:   'item_01',

      // [ISI: nama item kenangan — benda/momen spesifik]
      // Contoh: 'Foto Waktu Makan Bakso', 'Tiket Bioskop Sobek'
      name: '[NAMA ITEM / KENANGAN 1]',

      type: 'memory',

      // [ISI: cerita di balik kenangan ini — 1-3 kalimat]
      // Ini yang muncul saat player buka inventory nanti
      content: '[Cerita di balik kenangan ini. Tulis dengan hangat, boleh campur humor.]',
    },
  },

  // ════════════════════════════════════════
  // QUEST 2 — Quest tengah, ada pilihan & branching
  // Trigger: dialog NPC kedua selesai
  // ════════════════════════════════════════
  quest_02: {
    id:    'quest_02',

    // [ISI: judul quest 2]
    title: 'Misi: [JUDUL QUEST 2]',

    // [ISI: deskripsi quest 2]
    desc:  '[Deskripsi quest 2]',

    total: 1,

    reward: {
      id:   'item_02',

      // [ISI: nama item / kenangan 2]
      name: '[NAMA ITEM / KENANGAN 2]',

      type: 'memory',

      // [ISI: cerita kenangan 2]
      content: '[Cerita kenangan 2. Bisa lebih personal dari yang pertama.]',
    },
  },

  // ════════════════════════════════════════
  // QUEST 3 — Quest penutup, emosional
  // Trigger: dialog NPC ketiga selesai
  // Setelah ini → ending cutscene
  // ════════════════════════════════════════
  quest_03: {
    id:    'quest_03',

    // [ISI: judul quest 3 — bisa lebih serius/emosional]
    title: 'Misi: [JUDUL QUEST 3]',

    // [ISI: deskripsi quest 3]
    desc:  '[Deskripsi quest 3]',

    total: 1,

    reward: {
      id:   'item_03',

      // [ISI: nama item / kenangan 3 — yang paling bermakna]
      name: '[NAMA ITEM / KENANGAN 3]',

      type: 'memory',

      // [ISI: cerita kenangan 3 — yang paling bikin baper]
      content: '[Cerita kenangan 3. Ini yang terakhir sebelum ending — boleh tulus.]',
    },
  },

};