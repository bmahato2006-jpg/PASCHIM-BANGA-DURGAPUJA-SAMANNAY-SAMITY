import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';

// Remove surrounding quotes if accidentally pasted in Vercel
if (
  (rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) ||
  (rawPrivateKey.startsWith("'") && rawPrivateKey.endsWith("'"))
) {
  rawPrivateKey = rawPrivateKey.slice(1, -1);
}

// Convert literal \n to actual newlines and trim spaces
const formattedPrivateKey = rawPrivateKey.replace(/\\n/g, '\n').trim();

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'durgapur-puja-voting';

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey: formattedPrivateKey,
};

export const adminDb =
  getApps().length === 0
    ? getFirestore(
        initializeApp(
          clientEmail && formattedPrivateKey
            ? { credential: cert(serviceAccount) }
            : { projectId }
        )
      )
    : getFirestore();

export { FieldValue };
