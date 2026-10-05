import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';

let app: App | undefined = getApps()[0];

if (!app) {
  const projectId = 
    process.env.FIREBASE_PROJECT_ID || 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
    'durgapur-puja-voting';

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // 1. Trim leading/trailing whitespace
    privateKey = privateKey.trim();
    // 2. Strip surrounding double or single quotes if accidentally included
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1).trim();
    }
    // 3. Replace escaped literal '\n' with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      app = initializeApp({
        projectId,
      });
    }
  } catch (err: any) {
    console.warn('Firebase Admin initializeApp note:', err?.message || err);
  }
}

export const adminDb: Firestore = getFirestore();
export const adminAuth: Auth = getAuth();
export { FieldValue };
