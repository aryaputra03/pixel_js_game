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
  // NPC 1 — Kasir Kafe (judes, banyak roast)
  // Karakter: galak, sarkastik, gak ada filter ke pelanggan
  //
  // Flow: sapaan -> player pesan (branch menu) -> player komplain lama (branch sikap)
  // ════════════════════════════════════════════
  npc_ruang_santai: {
    id: 'npc_ruang_santai',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Mau pesan apa? Menu ada di atas. Tolong jangan nanya "yang rekomendasi apa" ya... Selera orang kan beda-beda.',

        choices: [
          { label: 'Es Kopi Susu gula aren ada?', next: 'npc_kasir_kopsus' },
          {
            label: 'Americano nya yang dingin ada gak?',
            next: 'npc_kasir_americano_dingin',
          },
        ],
      },
    ],
  },

  // Branch A: player nanya Es Kopi Susu gula aren
  npc_kasir_kopsus: {
    id: 'npc_kasir_kopsus',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Menu mainstream begitu mending beli di minimarket depan aja sana. Di sini cuma ada manual brew ama americano.',

        choices: [
          { label: 'Yaudah Americano aja?', next: 'npc_kasir_americano' },
        ],
      },
    ],
  },

  // Branch B: player langsung nanya Americano dingin
  npc_kasir_americano_dingin: {
    id: 'npc_kasir_americano_dingin',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Ada. Tapi inget ya, "dingin" itu cuma soal es, bukan soal rasanya jadi manis kayak yang kamu bayangin.',
      },
      {
        speaker: 'Kasir',
        text: 'Mau tetep pesan atau mau pikir-pikir dulu?',

        choices: [
          {
            label: 'Yaudah Americano dingin 1 ya',
            next: 'npc_kasir_americano',
          },
        ],
      },
    ],
  },

  // Player akhirnya pesan Americano
  npc_kasir_americano: {
    id: 'npc_kasir_americano',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Oke Americano 1 ya, size M aja ya yang ada cuman itu, oke silahkan duduk sana.',
      },
      {
        speaker: 'Kasir',
        text: 'Cepet duduk banyak yang ngantri ini!',

        choices: [{ label: 'Lanjut...', next: 'npc_kasir_komplain' }],
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC 1 (lanjutan) — Komplain pesanan lama
  // Otomatis lanjut dari sesi pesan Americano di atas
  // (player nunggu pesanan, lalu komplain)
  // ════════════════════════════════════════════
  npc_kasir_komplain: {
    id: 'npc_kasir_komplain',
    lines: [
      {
        speaker: 'Abil',
        text: 'Kak pesanan saya kok lama?',
      },
      {
        speaker: 'Kasir',
        text: 'Sabar kak, yang pesan bukan kamu doang, kamu gak sepenting itu kak.',

        choices: [
          {
            label: 'Saya sudah nunggu 15 menit kak',
            next: 'npc_kasir_komplain_15menit',
          },
        ],
      },
    ],
  },

  npc_kasir_komplain_15menit: {
    id: 'npc_kasir_komplain_15menit',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Baru 15 menit udah ngeluh. Tuh orang lain di pojokan udah nunggu 1 jam ngak komplain. Mau pesan lagi atau mau saya usir?',

        choices: [
          {
            label: 'Aku laporin ke manajer ya kak atitudenya',
            next: 'npc_kasir_komplain_manajer',
          },
        ],
      },
    ],
  },

  npc_kasir_komplain_manajer: {
    id: 'npc_kasir_komplain_manajer',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Silakan panggil. Manajernya aja takut sama saya. Lagian kalau saya di-pecat, saya malah senang bisa rebahan di rumah. Ada ancaman lain?',

        choices: [
          { label: 'Kasir stress', next: 'npc_kasir_komplain_stress' },
          {
            label: 'Yaudah kak, maaf deh, gak jadi laporin',
            next: 'npc_kasir_komplain_damai',
          },
        ],
      },
    ],
  },

  // Branch A: player balas nge-roast balik
  npc_kasir_komplain_stress: {
    id: 'npc_kasir_komplain_stress',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Emang! Coba aja kamu kerja di sini gajinya pas-pasan terus tiap hari musti ngadepin pelanggan modelan kamu, dijamin besoknya kamu langsung masuk RSJ.',
      },
      {
        speaker: 'Kasir',
        text: 'Cepet duduk banyak yang ngantri ini!',
        onEnd: 'startQuest:quest_01',
      },
    ],
  },

  // Branch B: player mengalah / minta maaf duluan
  npc_kasir_komplain_damai: {
    id: 'npc_kasir_komplain_damai',
    lines: [
      {
        speaker: 'Kasir',
        text: 'Nah gitu dong, dari awal aja gitu gausah ribut-ribut.',
      },
      {
        speaker: 'Kasir',
        text: 'Cepet duduk banyak yang ngantri ini!',
        onEnd: 'startQuest:quest_01',
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC 2 — Yola (pacar/dekat, perhatian, sibuk nyanyi gig)
  // Linear, tanpa percabangan
  // ════════════════════════════════════════════
  npc_markas: {
    id: 'npc_markas',
    lines: [
      {
        speaker: 'Yola',
        text: 'Eh, Abil... Akhirnya bisa ngobrol pas kamu selesai shift. Kamu kelihatan capek banget hari ini, habis dapet pesanan rombongan ya? Sini duduk dulu, istirahat sebentar.',
      },
      {
        speaker: 'Abil',
        text: 'Iya nih, dari pagi tadi mesin kopi gak berhenti nyala, mana kasir di depan lagi judes banget bikin makin pusing. Kamu sendiri gimana? Lagi sibuk jadwal gig nyanyi ya belakangan ini?',
      },
      {
        speaker: 'Yola',
        text: 'Lumayan padat sih, minggu ini aku ada jadwal latihan vokal tiap malam buat persiapan konser mini nanti. Tapi sesibuk-sibuknya aku, aku tetep kepikiran kamu yang harus berdiri seharian bikin kopi di sini.',
      },
      {
        speaker: 'Abil',
        text: 'Wah, denger kamu latihan tiap malam aja udah kedengeran melelahkan banget. Tapi makasih ya udah selalu perhatian dan sempetin mampir ke kafe cuma buat semangatin aku.',
      },
      {
        speaker: 'Yola',
        text: 'Sama-sama, Abil. Kita kan harus saling semangatin di tengah kesibukan kerjaan. Ya udah, lanjutin istirahat kamu gih. Jaga kesehatan ya, jangan lupa minum air putih biar suaramu gak serak kayak aku.',
      },
      {
        speaker: 'Abil',
        text: 'Siap, kamu juga ya! Sukses terus ya!',
        onEnd: 'startQuest:quest_02',
      },
    ],
  },

  // ════════════════════════════════════════════
  // NPC 3 — Kak PIC (atasan di kafe, galak tapi perhatian)
  // Linear, tanpa percabangan — tone mulai shift ke hangat
  // ════════════════════════════════════════════
  npc_pojok_cerita: {
    id: 'npc_pojok_cerita',
    lines: [
      {
        speaker: 'Kak PIC',
        text: 'Bisa-bisanya ya... Baru juga beres shift langsung keluyuran ke kafe lain. Bukannya pulang, mandi, terus tidur. Sengaja banget ya nyari tempat healing yang jauh biar gak ketemu saya?',
      },
      {
        speaker: 'Abil',
        text: 'Eh, Kak PIC? Kok bisa ada di sini juga? Kan Kakak lagi libur hari ini. Aku cuma mau nyari suasana baru aja Kak buat lepas penat, tadi bar kafe kita lagi hectic banget.',
      },
      {
        speaker: 'Kak PIC',
        text: 'Ya terserah saya dong, namanya juga hari libur. Tapi kamu itu dengerin ya, lepas penat itu gak harus ngopi lagi, Abil. Badan kamu itu butuh istirahat total, mata kamu aja udah kayak panda begitu.',
      },
      {
        speaker: 'Abil',
        text: 'Iya sih Kak, emang kerasa lumayan pegel banget badanku. Tapi beneran deh, duduk diem di sini sambil dengerin musik luar itu rasanya lumayan ngebantu ngilangin stres nge-bar tadi.',
      },
      {
        speaker: 'Kak PIC',
        text: 'Alasan aja terus. Ya udah, berhubung udah terlanjur di sini, habisin kopi kamu. Habis ini langsung pulang, jangan keluyuran lagi. Kalau besok kamu tepar dan gak masuk shift, saya yang repot!',
      },
      {
        speaker: 'Abil',
        text: 'Siap Kak PIC! Habis ini aku langsung pulang ke rumah kok, janji gak mampir-mampir lagi. Makasih ya Kak udah tetep perhatian walau lagi libur!',
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
        text: 'eh ada dek abil',
      },
      {
        speaker: 'Arya',
        text: 'gimana kerjaan aman kah, gak stress ama customer kah?',
      },
      {
        speaker: 'Arya',
        text: 'wkwkw semoga aman ya',
      },
      {
        speaker: 'Arya',
        text: 'btw gimana experience ama game ini?',
      },
      {
        speaker: 'Arya',
        text: 'ini game aku buat literally 2 mingguan doang wkwkwk',
      },
      {
        speaker: 'Arya',
        text: 'masih banyak bugnya sih, cuman masih ok gak sih?',
      },
      {
        speaker: 'Arya',
        text: 'ini cuman modal module javascript kalau kamu tahu, tanpa game engine',
      },
      {
        speaker: 'Arya',
        text: 'hhhmmmm',
      },
      {
        speaker: 'Arya',
        text: 'dah tgl 19 Juni ya',
      },
      {
        speaker: 'Arya',
        text: 'HBDDD abilszzz 🎉🎉🎉🥳',
      },
      {
        speaker: 'Arya',
        text: '73656d6f67612073656d616b696e2073756b7365732c2073656861742073656c616c752c2074616261682073616d6120637573746f6d657220616e6420646f20776861746576657220796f752077616e74',
      },
      {
        speaker: 'Arya',
        text: 'byeee',
      },
    ],
  },
  // ════════════════════════════════════════
  // 🐱 KUCING — di Taman Bunga
  // ════════════════════════════════════════
  garden_cat: {
    id: 'garden_cat',
    lines: [
      {
        speaker: 'Kucing',
        text: 'Meowww! HBD kak Abil! 🎉 Semoga panjang umur biar bisa ngabdi terus jadi babu aku meow.',
      },
      {
        speaker: 'Kucing',
        text: 'Karena kakak lagi ultah, mana sini pajak traktiran buat majikan? Minimal wiskas lah, meow!',
      },
      {
        speaker: 'Kucing',
        text: 'MEOOOOWWW LAPER BANGET!',
      },
      {
        speaker: 'Kucing',
        text: 'Buruan kasih makan! Meoww!! 😾',
      },
    ],
  },

  // ════════════════════════════════════════
  // 🐹 HAMSTER — di Taman Bunga
  // ════════════════════════════════════════
  garden_hamster: {
    id: 'garden_hamster',
    lines: [
      {
        speaker: 'Hamster',
        text: 'cit cit hbd kak abil cit! 🎉',
      },
      {
        speaker: 'Hamster',
        text: 'Sebagai pajaknya... mau kacang cit cit! Buruan jangan pelit!',
      },
      {
        speaker: 'Hamster',
        text: 'MANAAAAA KACANGGGGG CITTTT?!! 🐹',
      },
    ],
  },
};
