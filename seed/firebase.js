import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config();

const requiredKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}. Check your .env file.`);
  }
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('Firebase config loaded for project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Authenticate anonymously for writes (if rules require it)
export async function authenticate() {
  const auth = getAuth(app);
  try {
    await signInAnonymously(auth);
    console.log('✅ Anonymously authenticated for seeding.');
    return true;
  } catch (err) {
    console.warn('⚠️ Anonymous auth failed (check if enabled in Firebase Console):', err.message);
    // Continue anyway if rules allow unauth writes
    return false;
  }
}

// Test function to "warm up" the database (helps with NOT_FOUND on first write)
export async function testDatabase() {
  try {
    // Try a simple read (creates connection)
    const { getDocs, collection } = await import('firebase/firestore');
    await getDocs(collection(db, 'books'));
    console.log('✅ Database connection tested (collection exists or created).');
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
    throw err;
  }
}