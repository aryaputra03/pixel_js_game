// ============================================
// dialogs.js — Semua Dialog NPC & Cutscene
// Birthday Quest RPG · Tahap 8: Konten Personal
//
// ⚠️  PANDUAN PENGISIAN:
// - Ganti semua [ISI: ...] dengan teks aslimu
// - speaker = nama yang tampil di kotak dialog
// - text = isi dialog (typewriter akan mengetiknya)
// - choices = pilihan jawaban (opsional)
// - onEnd = event setelah line selesai (jangan diubah)
//
// TIPS MENULIS DIALOG RPG:
// - Tiap line idealnya 1-2 kalimat pendek
// - Jangan terlalu panjang — player baca sambil main
// - Boleh campur bahasa Indonesia + slang
// - Roast dulu, emosional belakangan
// ============================================

export const DIALOGS = {
  // ════════════════════════════════════════════
  // NPC 1 — di [NAMA RUANG 1]
  // Karakter: [ISI: sifat NPC ini — lucu? galak? mellow?]
  // ════════════════════════════════════════════
  npc_ruang_santai: {
    id: 'npc_ruang_santai',
    lines: [
      {
        // [ISI: nama NPC — bisa nama karakter lucu atau julukan]
        speaker: '[NAMA NPC 1]',

        // [ISI: sapaan pembuka — bisa roast langsung]
        // Contoh: 'Eh, akhirnya dateng juga. Kirain nyasar.'
        text: '[Sapaan pembuka NPC 1. Boleh roast, boleh hangat.]',
      },
      {
        speaker: '[NAMA NPC 1]',

        // [ISI: lanjutan — referensikan sesuatu yang kalian berdua tau]
        // Contoh: 'Inget gak waktu kita [kenangan]? Itu aku masih gak lupa.'
        text: '[Referensi inside joke atau kenangan pertama. 1-2 kalimat.]',
      },
      {
        speaker: '[NAMA NPC 1]',

        // [ISI: line penutup yang kasih misi]
        // Contoh: 'Oke, cukup nostalgianya. Ada yang harus kamu lakuin nih.'
        text: '[Line penutup yang memberi misi / petunjuk. Trigger quest di sini.]',
        onEnd: 'startQuest:quest_01',
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC 2 — di [NAMA RUANG 2]
  // NPC ini punya branching — player milih jawaban
  // Karakter: [ISI: sifat NPC 2]
  // ════════════════════════════════════════════
  npc_markas: {
    id: 'npc_markas',
    lines: [
      {
        speaker: '[NAMA NPC 2]',

        // [ISI: pembuka yang langsung kasih pilihan]
        // Contoh: 'Eh kamu tau gak, dulu kamu pernah bilang sesuatu yang...'
        text: '[Pembuka NPC 2 yang mengarah ke pertanyaan atau pilihan.]',

        choices: [
          // [ISI: dua opsi jawaban — bisa sama-sama lucu atau satu serius]
          { label: '[Pilihan A — misal: "Tau ah"]', next: 'npc_markas_a' },
          { label: '[Pilihan B — misal: "Gak tau deh"]', next: 'npc_markas_b' },
        ],
      },
    ],
  },

  // Branch A — jawaban pertama
  npc_markas_a: {
    id: 'npc_markas_a',
    lines: [
      {
        speaker: '[NAMA NPC 2]',

        // [ISI: respons untuk pilihan A]
        // Contoh: 'Nah! Makanya aku udah tau kamu dari dulu.'
        text: '[Respons untuk pilihan A. Bisa validasi atau counter-roast.]',
      },
      {
        speaker: '[NAMA NPC 2]',

        // [ISI: lanjutan + trigger quest]
        text: '[Line penutup NPC 2 yang memberi petunjuk quest 2.]',
        onEnd: 'startQuest:quest_02',
      },
    ],
  },

  // Branch B — jawaban kedua
  npc_markas_b: {
    id: 'npc_markas_b',
    lines: [
      {
        speaker: '[NAMA NPC 2]',

        // [ISI: respons untuk pilihan B — bisa lebih roast]
        // Contoh: 'Yah... typical kamu sih. Tapi ya udah, gapapa.'
        text: '[Respons untuk pilihan B. Bisa lebih skeptis atau lucu.]',
      },
      {
        speaker: '[NAMA NPC 2]',

        // [ISI: lanjutan + trigger quest — sama dengan branch A]
        text: '[Line penutup NPC 2 — sama dengan branch A boleh, atau variasi.]',
        onEnd: 'startQuest:quest_02',
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC 3 — di [NAMA RUANG 3]
  // NPC terakhir sebelum ending — tone mulai shift
  // dari lucu ke emosional/hangat
  // Karakter: [ISI: sifat NPC 3 — lebih mellow?]
  // ════════════════════════════════════════════
  npc_pojok_cerita: {
    id: 'npc_pojok_cerita',
    lines: [
      {
        speaker: '[NAMA NPC 3]',

        // [ISI: sapaan yang mulai agak serius]
        // Contoh: 'Kamu udah sampe sini. Gak nyangka juga sih.'
        text: '[Sapaan NPC 3 — mulai lebih serius, less roast.]',
      },
      {
        speaker: '[NAMA NPC 3]',

        // [ISI: referensi kenangan yang paling bermakna]
        // Contoh: 'Inget gak waktu kita [momen penting]? Aku masih sering mikirin itu.'
        text: '[Referensi kenangan yang paling bermakna dari kalian berdua.]',
      },
      {
        speaker: '[NAMA NPC 3]',

        // [ISI: kalimat yang "mengirimkan" player ke momen akhir]
        // Contoh: 'Ada satu hal lagi yang harus kamu tau. Pergi ke [tempat].'
        text: '[Line yang mengirimkan player ke quest terakhir.]',
        onEnd: 'startQuest:quest_03',
      },
    ],
  },

  // ════════════════════════════════════════════
  // EASTER EGG — tersembunyi di suatu sudut peta
  // Hanya dia yang akan mengerti
  // Tambahkan NPC baru di maps.js dengan dialogId ini
  // ════════════════════════════════════════════
  easter_egg: {
    id: 'easter_egg',
    lines: [
      {
        // [ISI: nama karakter easter egg — bisa nama benda/hewan/apapun]
        speaker: '[NAMA EASTER EGG]',

        // [ISI: referensi yang SANGAT spesifik — hanya dia yang paham]
        // Contoh: kode rahasia kalian, momen memalukan, quote lama, dll
        text: '[Inside joke paling tersembunyi. Yang baca cuma kalian berdua yang ngerti.]',
      },
      {
        speaker: '[NAMA EASTER EGG]',

        // [ISI: follow-up yang makin absurd atau makin spesifik]
        text: '[Lanjutan easter egg. Bisa makin absurd atau justru makin tulus.]',
      },
    ],
  },

  // ════════════════════════════════════════════
  // ENDING CUTSCENE
  //
  // Struktur yang disarankan:
  // Line 1-2 : Humor / roast terakhir
  // Line 3   : Tone shift — jadi lebih serius
  // Line 4-5 : Pesan tulus yang genuine
  // Line 6   : Ucapan ulang tahun yang sederhana tapi berasa
  //
  // Speaker bisa diganti nama kamu sendiri di line terakhir
  // ════════════════════════════════════════════
  ending_cutscene: {
    id: 'ending_cutscene',
    lines: [
      {
        speaker: '[ ??? ]',

        // [ISI: pembuka humor — bisa meta / breaking the 4th wall]
        // Contoh: 'Selamat. Kamu berhasil selesaiin game receh ini.'
        text: '[Line pembuka ending — humor dulu. Bisa meta/4th wall break.]',
      },
      {
        speaker: '[ ??? ]',

        // [ISI: roast terakhir sebelum serius]
        // Contoh: 'Emang sih, gamenya jelek. Tapi ada yang lebih penting dari itu.'
        text: '[Satu roast terakhir. Ini "penyeimbang" sebelum bagian tulus.]',
      },
      {
        speaker: '[ ??? ]',

        // [ISI: TONE SHIFT — kalimat yang jadi jembatan dari lucu ke serius]
        // Contoh: 'Tapi serius sebentar ya...'
        // Atau:   '...'
        // Atau:   'Oke. Sisanya gak akan aku jadiin bahan bercandaan.'
        text: '[Kalimat transisi. Pendek. Ini adalah momen shift tone.]',
      },
      {
        // [ISI: ganti dengan nama kamu sendiri di sini]
        speaker: '[NAMA KAMU]',

        // [ISI: pesan tulus pertama — apa yang paling ingin kamu sampaikan]
        // Tidak perlu panjang. Satu kalimat yang jujur lebih kuat dari paragraf.
        text: '[Pesan tulus pertama. Apa yang benar-benar ingin kamu bilang ke dia.]',
      },
      {
        speaker: '[NAMA KAMU]',

        // [ISI: pesan tulus kedua — bisa lebih spesifik]
        // Contoh: 'Kamu tuh [sifat positif yang jarang orang notice]. Dan itu gak biasa.'
        text: '[Pesan tulus kedua. Bisa tentang sifatnya yang kamu appreciate.]',
      },
      {
        speaker: '[NAMA KAMU]',

        // [ISI: ucapan ulang tahun — simpel, genuine, dari hati]
        // Contoh: 'Selamat ulang tahun, [nama]. Semoga tahun ini jadi yang terbaik.'
        text: '[Ucapan ulang tahun. Simpel. Genuine. Dari hati.]',
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC CAFÉ — Arya (pengunjung pojok kanan bawah)
  // Setelah dialog selesai → pintu terkunci café terbuka
  // ════════════════════════════════════════════
  cafe_arya: {
    id: 'cafe_arya',
    lines: [
      {
        speaker: 'Arya',
        text: 'Oh, ada yang masuk. Jarang ada orang sampai ke pojok sini.',
      },
      {
        speaker: 'Arya',
        text: 'Kamu lihat pintu di pojok kanan itu? Udah dari tadi aku penasaran. Terkunci rapat.',
      },
      {
        speaker: 'Arya',
        text: 'Eh, tadi aku nemu ini di bawah meja. Kunci kecil. Kayaknya buat pintu itu. Ambil aja.',
      },
      {
        speaker: 'Arya',
        text: 'Katanya di balik pintu itu ada taman. Kalau udah masuk, ceritain ya. Aku tunggu di sini sambil minum kopi.',
      },
    ],
  },
};
