// Node helper to add books
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase.js';

export async function addBook(book, maxRetries = 3) {
  const booksRef = collection(db, 'books');

  const payload = {
    ...book,
    publicationYear: Number(book.publicationYear),  // Ensure number (matches app)
    status: book.status ?? 'Available',
    statusHistory: [
      { status: book.status ?? 'Available', at: Timestamp.now() }
    ]
  };

  console.log(`Adding book: ${book.title} (attempt 1/${maxRetries})`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const docRef = await addDoc(booksRef, payload);
      console.log(`✔️ Added: ${book.title} (ID: ${docRef.id})`);
      return docRef;
    } catch (err) {
      console.error(`Attempt ${attempt} failed for ${book.title}:`, err.message);
      if (err.code === 'not-found' || err.message.includes('NOT_FOUND')) {  // Specific to gRPC Code 5
        if (attempt < maxRetries) {
          console.log(`Retrying in 2s... (NOT_FOUND often resolves after first write)`);
          await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 2s
          continue;
        }
      }
      throw err;  // Re-throw if no more retries
    }
  }
}