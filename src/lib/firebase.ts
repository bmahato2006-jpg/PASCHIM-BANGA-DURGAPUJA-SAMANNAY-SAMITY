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

// Dummy placeholder config to prevent build crashes during fresh setup
const dummyConfig = {
  apiKey: 'dummy-api-key',
  authDomain: 'dummy.firebaseapp.com',
  projectId: 'dummy-project',
  storageBucket: 'dummy.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:dummy',
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(dummyConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const appCheck = null;

export async function getOrSignInAnonymousUser(): Promise<string> {
  if (typeof window !== 'undefined') {
    let id = localStorage.getItem('durgapur_puja_anon_uid') || '';
    if (!id) {
      id = `anon-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('durgapur_puja_anon_uid', id);
    }
    return id;
  }
  return '';
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
  serverTimestamp,
};

export type { FirebaseUser };
