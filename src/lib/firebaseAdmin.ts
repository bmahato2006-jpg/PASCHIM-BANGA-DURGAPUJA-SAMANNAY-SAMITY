import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// Temporary dummy exports for fresh Firebase setup
export const adminDb: Firestore = null as unknown as Firestore;
export const adminAuth: any = null;
export { FieldValue };
