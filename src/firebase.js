import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration hardcoded for Hostinger deployment
const firebaseConfig = {
  apiKey: "AIzaSyD3wXNvZEiGBNdQIN9k_jYxZx5GVI4zFBg",
  authDomain: "instnat-website.firebaseapp.com",
  projectId: "instnat-website",
  storageBucket: "instnat-website.firebasestorage.app",
  messagingSenderId: "46236959424",
  appId: "1:46236959424:web:8e044c5d4f02e6703ee325",
  measurementId: "G-LM5DFDVBMN"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with Long-Polling enabled
// This fixes the "client is offline" error on Hostinger/Cloudflare
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
