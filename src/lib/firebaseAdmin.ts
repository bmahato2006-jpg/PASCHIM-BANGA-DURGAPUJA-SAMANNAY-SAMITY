import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';

let formattedPrivateKey = rawPrivateKey;
if ((formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) || 
    (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'"))) {
  formattedPrivateKey = formattedPrivateKey.slice(1, -1);
}
formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n').trim();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formattedPrivateKey,
};

export const adminDb = getApps().length === 0
  ? getFirestore(
      initializeApp(
        serviceAccount.clientEmail && serviceAccount.privateKey
          ? { credential: cert(serviceAccount) }
          : { projectId: serviceAccount.projectId || 'paschim-banga-durgapuja-ec1db' }
      )
    )
  : getFirestore();

export { FieldValue };
