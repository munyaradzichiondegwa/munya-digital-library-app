import admin from 'firebase-admin';
import fs from 'fs';

// Same init as seedBooks.js (copy-paste for simplicity)
const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing ${serviceAccountPath}.`);
}
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanBooks() {
  console.log('🧹 Cleaning books collection...\n');
  const booksRef = db.collection('books');
  const snapshot = await booksRef.get();
  let deleted = 0;

  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    deleted++;
  }

  console.log(`✅ Deleted ${deleted} books.`);
  await admin.app().delete();
  process.exit(0);
}

cleanBooks().catch(console.error);