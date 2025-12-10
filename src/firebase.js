import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase and Services
let app;
let auth;
let db;
let googleProvider;
let analytics;

try {
  // Simple validation to prevent crash if env vars are missing
  if (!firebaseConfig.apiKey) throw new Error("Missing Firebase API Key");

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Initialize Analytics only if supported and configured
  if (firebaseConfig.measurementId) {
    isSupported().then(yes => yes && (analytics = getAnalytics(app))).catch(() => { });
  }

} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // Export dummy objects to prevent import errors in App.jsx
  auth = { currentUser: null };
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };

// Helper functions (Robust exports)
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error("Firebase Auth not initialized");
  return signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  if (!auth) return;
  return signOut(auth);
};