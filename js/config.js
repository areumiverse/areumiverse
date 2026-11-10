/* =========================================================
   KONFIGURASI AREUMIVERSE
   ---------------------------------------------------------
   Backend dipilih otomatis:
   1. FIREBASE diisi  -> pakai Firebase (Auth + Firestore)
   2. API_URL diisi   -> pakai Google Apps Script + Spreadsheet
   3. Keduanya kosong -> MODE DEMO (data di browser saja)
   Panduan: SETUP-FIREBASE.md
   ========================================================= */
window.AREUMI_CONFIG = {
  // Tempel dari Firebase Console > Project settings > Your apps > SDK setup and configuration
  FIREBASE: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // (Alternatif) URL Web App Google Apps Script
  API_URL: "",

  // Nomor WhatsApp admin (format internasional tanpa +)
  WA_ADMIN: "628132014101",
  WA_DISPLAY: "+62 813-2014-101",

  BRAND: "AreumiVerse"
};
