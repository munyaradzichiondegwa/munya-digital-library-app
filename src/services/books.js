// src/services/books.js
// Firestore helpers for 'books' collection with optional notifications

import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

const booksCollection = collection(db, 'books');

/**
 * Fetch all books
 */
export async function getBooks(notify) {
  try {
    const snapshot = await getDocs(booksCollection);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (notify) notify.success('Books loaded!');
    return data;
  } catch (err) {
    if (notify) notify.error('Failed to load books.');
    throw err;
  }
}

/**
 * Fetch a single book by id
 */
export async function getBook(id, notify) {
  try {
    const snap = await getDoc(doc(db, 'books', id));
    if (!snap.exists()) {
      if (notify) notify.error('Book not found.');
      return null;
    }
    const data = { id: snap.id, ...snap.data() };
    if (notify) notify.success('Book details loaded.');
    return data;
  } catch (err) {
    if (notify) notify.error('Failed to load book.');
    throw err;
  }
}

/**
 * Add a new book
 */
export async function addBook(book, notify) {
  const bookData = {
    ...book,
    publicationYear: Number(book.publicationYear),
    status: book.status ?? 'Available',
    statusHistory: (book.statusHistory ?? [{
      status: book.status ?? 'Available',
      at: Timestamp.now()
    }]).map(sh => ({
      ...sh,
      at: sh.at instanceof Timestamp ? sh.at : Timestamp.fromDate(new Date(sh.at))
    }))
  };

  try {
    const docRef = await addDoc(booksCollection, bookData);
    if (notify) notify.success(`Book "${book.title}" added!`);
    return docRef;
  } catch (err) {
    if (notify) notify.error('Failed to add book.');
    throw err;
  }
}

/**
 * Update a book by id
 */
export async function updateBook(id, bookPartial, notify) {
  try {
    const ref = doc(db, 'books', id);
    await updateDoc(ref, bookPartial);
    if (notify) notify.success('Book updated!');
    return ref;
  } catch (err) {
    if (notify) notify.error('Failed to update book.');
    throw err;
  }
}

/**
 * Delete a book by id
 */
export async function deleteBook(id, notify) {
  try {
    const ref = doc(db, 'books', id);
    await deleteDoc(ref);
    if (notify) notify.success('Book deleted!');
    return ref;
  } catch (err) {
    if (notify) notify.error('Failed to delete book.');
    throw err;
  }
}