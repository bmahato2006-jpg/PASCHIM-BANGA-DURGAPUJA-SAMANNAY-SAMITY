/**
 * Paschim Banga DurgaPuja Samannay Samity
 * One-Time Maintenance Script: Clear All Test / Demo Data
 *
 * Wipes all test documents from:
 * - committees
 * - pandals
 * - votes_log
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[match[1].trim()] = val;
    }
  }
}

loadEnv();

let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
    (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey.replace(/\\n/g, '\n').trim();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
};

const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApps()[0];

const db = getFirestore(app);

async function deleteCollection(collectionName, batchSize = 100) {
  const colRef = db.collection(collectionName);
  let totalDeleted = 0;
  const deletedDocIds = [];

  while (true) {
    const snapshot = await colRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      deletedDocIds.push(doc.id);
      batch.delete(doc.ref);
    });

    await batch.commit();
    totalDeleted += snapshot.size;
    console.log(`  -> Deleted batch of ${snapshot.size} docs from "${collectionName}"...`);
  }

  return { totalDeleted, deletedDocIds };
}

async function runCleanup() {
  console.log('===========================================================');
  console.log('🧹 INITIATING COMPLETE FIRESTORE DEMO/TEST DATA CLEANUP');
  console.log('Project ID:', serviceAccount.projectId);
  console.log('===========================================================\n');

  const targets = ['committees', 'pandals', 'votes_log'];
  const summary = {};

  for (const col of targets) {
    console.log(`Clearing collection: "${col}"...`);
    const { totalDeleted, deletedDocIds } = await deleteCollection(col);
    summary[col] = { count: totalDeleted, ids: deletedDocIds };
    console.log(`✅ Collection "${col}" wiped: ${totalDeleted} document(s) removed.\n`);
  }

  console.log('===========================================================');
  console.log('🎉 CLEANUP COMPLETE! SUMMARY OF DELETED COLLECTIONS:');
  console.log('-----------------------------------------------------------');
  for (const [col, info] of Object.entries(summary)) {
    console.log(`• ${col.padEnd(15)} : ${info.count} documents removed`);
  }
  console.log('===========================================================');
  console.log('Database is now completely fresh and ready for public launch.');
}

runCleanup().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
