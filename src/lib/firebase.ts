import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-config';

// Check if credentials are placeholder
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes('YOUR_API_KEY_HERE')
  );
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Layer 1: Force Persistent Anonymous Auth with browserLocalPersistence
  if (typeof window !== 'undefined' && auth) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Firebase browserLocalPersistence initialization warning:', error);
    });
  }

  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

export { app, auth, db, googleProvider };

