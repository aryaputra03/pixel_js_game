// ============================================
// dialogs_garden_animals.js
// Dialog NPC hewan di Taman Bunga (Map 3).
//
// CARA PAKAI:
// Merge export GARDEN_ANIMAL_DIALOGS ke dalam
// objek DIALOGS di file dialogs.js:
//
//   import { GARDEN_ANIMAL_DIALOGS } from './dialogs_garden_animals.js';
//
//   export const DIALOGS = {
//     ...GARDEN_ANIMAL_DIALOGS,   // ← tambahkan baris ini
//     npc_ruang_santai: { ... },
//     cafe_arya: { ... },
//     ...
//   };
//
// Atau copy langsung isi garden_cat & garden_hamster
// ke dalam DIALOGS yang sudah ada.
// ============================================

export const GARDEN_ANIMAL_DIALOGS = {
  // ════════════════════════════════════════════
  // 🐱 KUCING — duduk dekat kolam di taman
  //
  // Kucing ini pengamat diam yang ternyata bijak.
  // Dialog-nya singkat, sedikit misterius, sedikit
  // cute. Kucing tidak banyak bicara — tapi kalau
  // bicara, berasa ada maknanya.
  //
  // Gaya: tenang, tidak buru-buru, sesekali
  // memandang jauh. Bicara dari sudut pandang kucing
  // yang sudah lama tinggal di taman.
  // ════════════════════════════════════════════
  garden_cat: {
    id: 'garden_cat',
    lines: [
      {
        speaker: '🐱 Kucing',
        // Kucing melirik sebentar, lalu balik lihat kolam.
        // Tidak terlalu peduli, tapi tidak mengusir juga.
        text: '...Mrreow.',
      },
      {
        speaker: '🐱 Kucing',
        // Kucing menoleh dengan ekspresi "oh, kamu masih di sini."
        text: 'Kamu bukan pertama yang duduk di sini sambil mikir terlalu banyak.',
      },
      {
        speaker: '🐱 Kucing',
        // Wisdom kucing: kadang diam itu jawaban.
        text: 'Aku sudah di sini lama. Taman ini dengar semuanya. Airnya, bunganya... semua.',
      },
      {
        speaker: '🐱 Kucing',
        // Penutup: balik tidur / balik lihat kolam.
        // Kucing itu seperlunya — tidak lebih.
        text: 'Purrr... *mengelus punggungku sendiri dan tidak peduli lagi*',
      },
    ],
  },

  // ════════════════════════════════════════════
  // 🐹 HAMSTER — berlarian di area rumput
  //
  // Hamster ini KEBALIKAN dari kucing.
  // Energetik, antusias, banyak bicara, excited
  // tentang hal-hal kecil. Pipinya penuh biji.
  //
  // Gaya: cepat, bersemangat, kadang ngelantur,
  // sering diselingi *nom nom* karena sedang makan.
  // ════════════════════════════════════════════
  garden_hamster: {
    id: 'garden_hamster',
    lines: [
      {
        speaker: '🐹 Hamster',
        // Melihat player dengan mata bulat antusias.
        text: 'OH HAI!! *berhenti berlarian* Kamu mau elus aku ya? YA BOLEH!!',
      },
      {
        speaker: '🐹 Hamster',
        // Nyerocos sambil ngunyah.
        text: '*nom nom* Aku lagi nyimpan biji bunga ini di pipi. Muat tiga biji lagi sebelum penuh!',
      },
      {
        speaker: '🐹 Hamster',
        // Hamster tidak bisa diam dan selalu excited.
        text: 'Taman ini BAGUS BANGET!! Aku udah muter 47 kali hari ini. Mau ikut?!',
      },
      {
        speaker: '🐹 Hamster',
        // Penutup cepat karena tidak bisa diam terlalu lama.
        text: 'OKE MAKASIH UDAH MAMPIR!! *langsung lari lagi dengan kecepatan penuh*',
      },

      //
    ],
  },
};
