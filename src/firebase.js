import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"; // Added missing imports
import { getFirestore } from "firebase/firestore"; // Added for RAG logging/Analytics
import { getAnalytics } from "firebase/analytics"; // Added for Analytics

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

try {
  // Simple validation to prevent crash if env vars are missing
  if (!firebaseConfig.apiKey) throw new Error("Missing Firebase API Key");

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // Export dummy objects to prevent import errors in App.jsx
  auth = { currentUser: null };
  db = null;
}

export { auth, db, googleProvider };

// Only init analytics if supported (optional safety check)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics not supported in this environment");
}

// Helper functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);