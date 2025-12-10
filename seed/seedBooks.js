// seed/seedBooks.js
// Full seeding script for books collection using Firebase Admin SDK.
// Includes authentication, error handling, and full books dataset.
// Run with: node seed/seedBooks.js (ensure "type": "module" in package.json)

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../src/firebase.js';  // Adjust path if seed/ is at root (points to src/firebase.js)

dotenv.config();

console.log('Project ID from .env:', process.env.REACT_APP_FIREBASE_PROJECT_ID);

// Initialize Admin SDK with service account
const serviceAccountPath = path.resolve('./serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing ${serviceAccountPath}. Download from Firebase Console > Project Settings > Service accounts > Generate new private key (JSON). Place in project root.`);
}

// ESM-safe way to load JSON synchronously
const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
const serviceAccount = JSON.parse(serviceAccountData);

console.log('Project ID from service account:', serviceAccount.project_id);  // Diagnostic

if (!serviceAccount.project_id || serviceAccount.project_id !== process.env.REACT_APP_FIREBASE_PROJECT_ID) {
  throw new Error('Service account project_id mismatch with .env. Regenerate key or check .env.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('Admin SDK initialized for project:', admin.app().options.projectId);  // Diagnostic

// Full books dataset
const books = [
  { title: "Nervous Conditions", author: "Tsitsi Dangarembga", genre: "Fiction", publicationYear: 1988 },
  { title: "Matigari", author: "Ngũgĩ wa Thiong’o", genre: "Fiction", publicationYear: 1986 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", publicationYear: 1925 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", publicationYear: 1960 },
  { title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", publicationYear: 1813 },

  { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", publicationYear: 2011 },
  { title: "Educated", author: "Tara Westover", genre: "Non-Fiction", publicationYear: 2018 },
  { title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Non-Fiction", publicationYear: 1947 },
  { title: "Becoming", author: "Michelle Obama", genre: "Non-Fiction", publicationYear: 2018 },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", genre: "Non-Fiction", publicationYear: 1997 },

  { title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", publicationYear: 2011 },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography", publicationYear: 1994 },
  { title: "Einstein", author: "Walter Isaacson", genre: "Biography", publicationYear: 2007 },
  { title: "Alexander Hamilton", author: "Ron Chernow", genre: "Biography", publicationYear: 2004 },
  { title: "The Story of My Experiments with Truth", author: "Mahatma Gandhi", genre: "Biography", publicationYear: 1927 },

  { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", publicationYear: 1965 },
  { title: "Neuromancer", author: "William Gibson", genre: "Sci-Fi", publicationYear: 1984 },
  { title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi", publicationYear: 1951 },
  { title: "Ender’s Game", author: "Orson Scott Card", genre: "Sci-Fi", publicationYear: 1985 },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Sci-Fi", publicationYear: 1969 },

  { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery", publicationYear: 1902 },
  { title: "Murder on the Orient Express", author: "Agatha Christie", genre: "Mystery", publicationYear: 1934 },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", publicationYear: 2005 },
  { title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery", publicationYear: 2012 },
  { title: "In the Woods", author: "Tana French", genre: "Mystery", publicationYear: 2007 }
];

async function seedBooks() {
  try {
    console.log("📘 Starting Admin SDK seeding...\n");

    // New: Authenticate using client-side firebase.js (for any auth-required rules)
    await authenticate();

    const booksRef = db.collection('books');

    // Diagnostic: Test write (creates temp doc to initialize Firestore if needed)
    console.log('🔧 Testing Firestore write...');
    const testDocRef = await booksRef.add({ test: 'init', temp: true });
    console.log(`✅ Test write succeeded (ID: ${testDocRef.id}). Deleting...`);
    await testDocRef.delete();
    console.log('🔧 Test complete.\n');

    let successCount = 0;
    let errorCount = 0;

    for (const book of books) {
      try {
        await booksRef.add({
          ...book,
          publicationYear: Number(book.publicationYear),
          status: 'Available',
          statusHistory: [{
            status: 'Available',
            at: admin.firestore.Timestamp.now()
          }]
        });
        console.log(`✔️ Added: ${book.title}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to add: ${book.title}`, err);  // Full error (code, message, details)
        errorCount++;
      }
    }

    console.log(`\n🎉 Seeding finished! Success: ${successCount}, Errors: ${errorCount}`);
    if (errorCount === 0) {
      console.log('✅ Check Firebase Console > Firestore > books collection to verify.');
    } else {
      console.log('💡 If errors occurred, ensure Firestore rules allow writes (update to auth-required if needed).');
    }
  } catch (err) {
    console.error('❌ Fatal seeding error:', err);
  } finally {
    // Clean up Admin SDK
    await admin.app().delete();
    process.exit(errorCount > 0 ? 1 : 0);
  }
}

seedBooks();