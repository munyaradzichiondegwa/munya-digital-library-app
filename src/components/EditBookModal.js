// src/components/EditBookModal.js
// Minimal modal to edit book fields and update via updateBook
// - uses updateBook from services
// - on save we close (changes are reflected via onSnapshot in BookList.js)

import React, { useState } from 'react';
import { updateBook } from '../services/books.js';  // Added .js extension

export default function EditBookModal({ book, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || 'Fiction',
    publicationYear: book.publicationYear || '',
    status: book.status || 'Available'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuses = ['Available', 'Borrowed', 'Reserved', 'Reading', 'Returned', 'Read'];

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    // simple validation
    if (!formData.title || !formData.author || !formData.publicationYear) {
      setError('Title, Author and Year required.');
      return;
    }

    // Year validation (match AddBookForm)
    const year = parseInt(formData.publicationYear);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      setError('Please enter a valid publication year (1000 - current year).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // when changing status here, we also push to history
      let history = book.statusHistory ? [...book.statusHistory] : [];
      if (formData.status !== book.status) {
        history.push({ status: formData.status, at: new Date().toISOString() });
      }

      await updateBook(book.id, {
        ...formData,
        publicationYear: year,  // Ensure number
        statusHistory: history
      });

      setLoading(false);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setError('Failed to save changes.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>

      <div className="bg-white p-6 rounded shadow-lg z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Edit Book</h3>

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="grid grid-cols-1 gap-3">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="px-3 py-2 border rounded" />
          <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" className="px-3 py-2 border rounded" />
          <input name="publicationYear" type="number" value={formData.publicationYear} onChange={handleChange} placeholder="Year" className="px-3 py-2 border rounded" min="1000" max={new Date().getFullYear()} />
          <select name="genre" value={formData.genre} onChange={handleChange} className="px-3 py-2 border rounded">
            <option>Fiction</option>
            <option>Non-Fiction</option>
            <option>Sci-Fi</option>
            <option>Mystery</option>
            <option>Biography</option>
            <option>Unknown</option>
          </select>
          <select name="status" value={formData.status} onChange={handleChange} className="px-3 py-2 border rounded">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded" disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}