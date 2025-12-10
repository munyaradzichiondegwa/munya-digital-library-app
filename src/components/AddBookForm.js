// src/components/AddBookForm.js
// Uses addBook from services. Comments like I'm the dev writing this.

import React, { useState } from 'react';
import { addBook } from '../services/books.js';

export default function AddBookForm({ onAdded }) {  // Added prop
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    publicationYear: '',
    status: 'Available'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography'];
  const statuses = ['Available', 'Borrowed', 'Reserved', 'Reading', 'Returned', 'Read'];

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.publicationYear) {
      setError('Title, Author, and Year are required.');
      return;
    }

    const year = parseInt(formData.publicationYear);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      setError('Please enter a valid publication year.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await addBook(formData);
      if (onAdded) onAdded();  // Call callback after success

      // clear form
      setFormData({
        title: '',
        author: '',
        genre: 'Fiction',
        publicationYear: '',
        status: 'Available'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to add book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          name="publicationYear"
          type="number"
          placeholder="Publication Year"
          value={formData.publicationYear}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
          min="1000"
          max={new Date().getFullYear()}
          disabled={loading}
        />
        <select name="genre" value={formData.genre} onChange={handleChange} className="px-4 py-2 border rounded" disabled={loading}>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select name="status" value={formData.status} onChange={handleChange} className="px-4 py-2 border rounded" disabled={loading}>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded">
        {loading ? 'Adding...' : 'Add Book'}
      </button>
    </form>
  );
}