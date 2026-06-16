// vite.config.js
export default {
  // Base URL untuk deployment — ubah jika deploy ke subfolder
  base: './',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },

  server: {
    port: 5173,
    // Aktifkan akses dari HP di jaringan yang sama
    // (berguna saat testing di HP via WiFi lokal)
    host: true,
  },
};
