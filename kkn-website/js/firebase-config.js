// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compact.js"; // sesuaikan import app kamu jika berbeda
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 1. Import Module App Check SDK v10.8.0
import { 
  initializeAppCheck, 
  ReCaptchaV3Provider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-appcheck.js";

// Konfigurasi Project Firebase kamu
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// 2. Auto Debug Token (Khusus Lingkungan Pengujian Localhost)
// Ini mencegah request Firestore/Storage terblokir saat testing lokal
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  self.FIREBASE_APPCHECK_EXECUTE_IN__SAFETY = true;
  self.FIREBASE_APP_CHECK_DEBUG_TOKEN = true;
}

// 3. Konfigurasi Site Key & Inisialisasi App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LelrGwtAAAAANR9FBh5KlSyvjkoiPTweveUxvXQ'),
  isTokenAutoRefreshEnabled: true
});

// 4. Inisialisasi Database & Storage (Otomatis Terproteksi App Check Token)
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, appCheck };