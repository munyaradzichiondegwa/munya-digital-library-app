// src/services/books.js
// Firestore helpers for 'books' collection

import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.js'; // make sure firebase.js exports 'db'

const booksCollection = collection(db, 'books');

/**
 * Fetch all books
 */
export async function getBooks() {
  const snapshot = await getDocs(booksCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single book by id
 */
export async function getBook(id) {
  const snap = await getDoc(doc(db, 'books', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Add a new book
 */
export async function addBook(book) {
  const bookData = {
    ...book,
    publicationYear: Number(book.publicationYear),
    statusHistory: (book.statusHistory ?? [{
      status: book.status ?? 'Available',
      at: Timestamp.now()
    }]).map(sh => ({
      ...sh,
      at: sh.at instanceof Timestamp ? sh.at : Timestamp.fromDate(new Date(sh.at))
    }))
  };

  return await addDoc(booksCollection, bookData);
}

/**
 * Update a book by id
 */
export async function updateBook(id, bookPartial) {
  const ref = doc(db, 'books', id);
  return await updateDoc(ref, bookPartial);
}

/**
 * Delete a book by id
 */
export async function deleteBook(id) {
  const ref = doc(db, 'books', id);
  return await deleteDoc(ref);
}
