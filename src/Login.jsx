import React from 'react';
import { Lock } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

const Login = ({ onOfflineLogin }) => {
  const handleLogin = async () => {
    // 1. Safety Check: If auth failed to init (e.g. env vars missing), prevent crash
    if (!auth || !auth.currentUser) {
      // Note: auth itself might be the dummy object { currentUser: null } from firebase.js catch block
      // We need to check if it's a real Auth instance. Real instances have methods.
      if (!auth || !auth.signOut) {
        console.warn("Auth system inactive.");
        alert("Authentication service is currently unavailable. Please check configuration.");
        // Fallback for demo/dev if desired
        if (onOfflineLogin) onOfflineLogin();
        return;
      }
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
        // Fallback for restrictive environments
        try {
          await signInAnonymously(auth);
        } catch (anonError) {
          alert(`Login failed: ${anonError.message}`);
        }
      } else {
        alert(`Authentication failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-transparent text-white font-sans animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full text-center">
        <div className="bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
        <p className="text-neutral-400 mb-8">
          This area requires Director-level clearance. Please authenticate to continue.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-white text-neutral-950 font-bold py-3 px-6 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;