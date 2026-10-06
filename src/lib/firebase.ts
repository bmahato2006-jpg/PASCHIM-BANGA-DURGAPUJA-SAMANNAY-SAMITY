'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
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
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Silently authenticate the voter using Firebase Anonymous Auth if not signed in.
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
  app, 
  auth, 
  db,
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
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
};

export type { FirebaseUser };
