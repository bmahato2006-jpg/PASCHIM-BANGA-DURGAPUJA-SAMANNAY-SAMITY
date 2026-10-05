'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInAnonymously as fbSignInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

// Firebase Client Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildAndDev1234567890',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'durgapur-puja-voting.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'durgapur-puja-voting',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'durgapur-puja-voting.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890abcdef',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize or retrieve existing Firebase App singleton
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Optional App Check with reCAPTCHA v3 initialization (browser-only)
export let appCheck: AppCheck | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('Firebase App Check initialization error:', err);
  }
}

/**
 * Silently authenticate the user using Firebase Anonymous Auth if not already signed in.
 * Returns the resolved Firebase user UID.
 */
export async function getOrSignInAnonymousUser(): Promise<string> {
  if (typeof window === 'undefined') return '';

  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  try {
    const cred = await fbSignInAnonymously(auth);
    if (cred.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('durgapur_puja_anon_uid', cred.user.uid);
      }
      return cred.user.uid;
    }
  } catch (err: any) {
    console.warn('Firebase Anonymous Auth notice:', err?.message || err);
  }

  // Resilient fallback using persistent client ID
  let fallbackId = '';
  if (typeof window !== 'undefined') {
    fallbackId = localStorage.getItem('durgapur_puja_anon_uid') || '';
    if (!fallbackId) {
      fallbackId = `anon-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('durgapur_puja_anon_uid', fallbackId);
    }
  }
  return fallbackId;
}

export {
  fbSignInAnonymously as signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut as signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp
};

export type { FirebaseUser };
