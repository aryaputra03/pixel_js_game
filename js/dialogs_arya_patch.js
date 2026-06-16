// ============================================
// dialogs_arya_patch.js
// Tambahan dialog untuk NPC Arya di café.
//
// CARA PAKAI:
// Copy entry 'cafe_arya' di bawah ini ke dalam
// objek DIALOGS di file dialogs.js yang sudah ada.
//
// Letakkan di dalam export const DIALOGS = { ... }
// setelah entry yang sudah ada.
// ============================================

// ─── TAMBAHKAN KE DALAM DIALOGS { } DI dialogs.js ───

/*

  // ════════════════════════════════════════════
  // NPC CAFÉ — Arya
  // Pengunjung muda, duduk di pojok kanan bawah café
  // Setelah dialog ini selesai → pintu terkunci di pojok
  // kanan bawah café akan terbuka otomatis
  //
  // Karakter Arya:
  //   - Santai, ramah, sedikit misterius
  //   - Tahu sesuatu tentang pintu di pojok itu
  //   - Gaya bicara kasual, anak muda
  // ════════════════════════════════════════════
  cafe_arya: {
    id: 'cafe_arya',
    lines: [
      {
        speaker: 'Arya',

        // Line 1 — sapaan santai dari pojok café
        // Contoh: 'Oh, ada yang baru masuk. Jarang ada orang sampai ke sini.'
        text: '[Sapaan santai Arya. Dia duduk di pojok, kelihatannya sudah lama di sana.]',
      },
      {
        speaker: 'Arya',

        // Line 2 — Arya tahu tentang pintu terkunci itu
        // Contoh: 'Kamu lihat pintu itu? Yang di pojok sana.'
        //         'Aku udah penasaran dari tadi. Tapi kuncinya entah di mana.'
        text: '[Arya menyebut pintu terkunci di pojok. Dia juga penasaran soal itu.]',
      },
      {
        speaker: 'Arya',

        // Line 3 — Arya mau bantu / kasih info kunci
        // Contoh: 'Tadi aku nemu ini di bawah meja. Kayaknya kunci buat pintu itu.'
        //         'Mungkin kamu yang harus masuk ke sana.'
        text: '[Arya kasih info atau petunjuk soal kunci / pintu. Ini trigger unlock pintu.]',
      },
      {
        speaker: 'Arya',

        // Line 4 — penutup
        // Contoh: 'Kalau udah balik, ceritain ya apa yang ada di dalam.'
        //         'Aku tunggu di sini sambil minum kopi.'
        text: '[Line penutup Arya. Santai, tidak buru-buru. Tetap di kursinya.]',
      },
    ],
  },

*/

// ─────────────────────────────────────────────────────────
// Berikut adalah versi placeholder yang sudah diisi
// dengan teks default agar game bisa langsung dijalankan.
// Ganti teks di dalam kutip sesuai konten personalmu.
// ─────────────────────────────────────────────────────────

export const ARYA_DIALOG_ENTRY = {
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
        text: 'Kalau udah masuk, ceritain ya apa yang ada di dalem. Aku tunggu di sini.',
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────
// Untuk menggunakan ARYA_DIALOG_ENTRY, import dan merge
// ke dalam DIALOGS di dialogs.js:
//
//   import { ARYA_DIALOG_ENTRY } from './dialogs_arya_patch.js';
//
//   export const DIALOGS = {
//     ...ARYA_DIALOG_ENTRY,    // ← tambahkan baris ini
//     npc_ruang_santai: { ... },
//     npc_markas: { ... },
//     ...
//   };
//
// ATAU copy langsung isi cafe_arya ke dalam DIALOGS.
// ─────────────────────────────────────────────────────────
