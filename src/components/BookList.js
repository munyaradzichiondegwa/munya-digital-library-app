// src/components/BookList.js
// Full-featured Book list with enhanced notifications

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { deleteBook, updateBook } from '../services/books.js';
import { toast } from 'react-toastify';  // New: For notifications
import EditBookModal from './EditBookModal.js';
import Pagination from './Pagination.js';

const STATUS_OPTIONS = ['Available', 'Borrowed', 'Reserved', 'Reading', 'Returned', 'Read'];

export default function BookList({ genre: propGenre, refreshTrigger }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const previousBooksLength = useRef(books.length);  // New: Track changes for toasts

  // UI controls (unchanged)
  const [genreFilter, setGenreFilter] = useState(propGenre || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setGenreFilter(propGenre || 'All');

    let q = collection(db, 'books');
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => {
          const obj = d.data();
          if (!obj.genre) obj.genre = 'Unknown';
          if (!obj.status) obj.status = 'Available';
          if (!obj.statusHistory || obj.statusHistory.length === 0) {
            obj.statusHistory = [{
              status: obj.status,
              at: new Date().toISOString()
            }];
          } else {
            obj.statusHistory = obj.statusHistory.map(h => ({
              status: h.status,
              at: h.at.toDate ? h.at.toDate().toISOString() : (h.at || new Date().toISOString())
            }));
          }
          return { id: d.id, ...obj };
        });
        setBooks(data);
        setLoading(false);

        // New: Detect and notify changes
        const currentLength = data.length;
        if (snap.metadata.hasPendingWrites) {
          toast.info('Syncing changes...');
        }
        if (currentLength > previousBooksLength.current) {
          toast.success('New book added!');
        } else if (currentLength < previousBooksLength.current) {
          toast.warning('A book was removed.');
        }
        previousBooksLength.current = currentLength;  // Update ref
      },
      err => {
        console.error('Firestore error:', err);
        setError('Failed to load books.');
        toast.error('Failed to load books.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [refreshTrigger, propGenre]);

  // Derived list (unchanged - filtering, sorting, etc.)
  const processed = useMemo(() => {
    let list = [...books];

    if (search.trim() !== '') {
      const s = search.trim().toLowerCase();
      list = list.filter(b =>
        (b.title || '').toLowerCase().includes(s) ||
        (b.author || '').toLowerCase().includes(s)
      );
    }

    if (genreFilter !== 'All') {
      list = list.filter(b => b.genre === genreFilter);
    }

    if (statusFilter !== 'All') {
      list = list.filter(b => b.status === statusFilter);
    }

    list.sort((a, b) => {
      let av, bv;
      if (sortBy === 'title') {
        av = (a.title || '').toLowerCase();
        bv = (b.title || '').toLowerCase();
      } else if (sortBy === 'author') {
        av = (a.author || '').toLowerCase();
        bv = (b.author || '').toLowerCase();
      } else {
        av = a.publicationYear || 0;
        bv = b.publicationYear || 0;
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [books, search, genreFilter, statusFilter, sortBy, sortDir]);

  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = processed.slice((page - 1) * pageSize, page * pageSize);

  // Actions (unchanged, but add toasts if needed)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book permanently?')) return;
    try {
      await deleteBook(id);
      toast.success('Book deleted!');
    } catch (err) {
      toast.error('Failed to delete book.');
    }
  };

  const changeStatus = async (book, newStatus) => {
    const now = new Date().toISOString();
    const history = book.statusHistory ? [...book.statusHistory] : [];
    history.push({ status: newStatus, at: now });

    try {
      await updateBook(book.id, {
        status: newStatus,
        statusHistory: history
      });
      toast.success(`Status updated to ${newStatus}!`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const onBorrow = (book) => changeStatus(book, 'Borrowed');
  const onReturn = (book) => changeStatus(book, 'Returned');
  const onStartReading = (book) => changeStatus(book, 'Reading');
  const onMarkRead = (book) => changeStatus(book, 'Read');

  const openEdit = (book) => setEditing(book);
  const closeEdit = () => setEditing(null);
  const onEditSaved = () => {
    toast.success('Book updated!');
    closeEdit();
  };

  if (loading) return <div className="mt-6">Loading books...</div>;
  if (error) return <div className="mt-6 text-red-600">{error}</div>;

  // Rest of JSX unchanged (controls, table, pagination, modal)
  return (
    <div className="mt-6 space-y-4">
      {/* Controls row - unchanged */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 items-center">
          <input
            placeholder="Search title or author..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded"
          />
          <select value={genreFilter} onChange={e => { setGenreFilter(e.target.value); setPage(1); }} className="px-2 py-1 border rounded">
            <option value="All">All genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Mystery">Mystery</option>
            <option value="Biography">Biography</option>
            <option value="Unknown">Unknown</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-2 py-1 border rounded">
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm">Sort</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2 py-1 border rounded">
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
          </select>
          <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="px-2 py-1 border rounded">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Table - unchanged */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left">Title</th>
              <th className="px-4 py-2 border text-left">Author</th>
              <th className="px-4 py-2 border text-left">Genre</th>
              <th className="px-4 py-2 border text-left">Year</th>
              <th className="px-4 py-2 border text-left">Status</th>
              <th className="px-4 py-2 border text-left">Actions</th>
              <th className="px-4 py-2 border text-left">History</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(book => (
              <tr key={book.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-2 border">{book.title}</td>
                <td className="px-4 py-2 border">{book.author}</td>
                <td className="px-4 py-2 border">{book.genre}</td>
                <td className="px-4 py-2 border">{book.publicationYear}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    book.status === 'Available' ? 'bg-green-200 text-green-800' :
                    book.status === 'Borrowed' ? 'bg-yellow-200 text-yellow-800' :
                    book.status === 'Reading' ? 'bg-blue-200 text-blue-800' :
                    book.status === 'Read' ? 'bg-indigo-200 text-indigo-800' :
                    book.status === 'Returned' ? 'bg-gray-200 text-gray-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {book.status}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => openEdit(book)} className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Edit</button>
                    <button onClick={() => handleDelete(book.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
                    {book.status !== 'Borrowed' && (
                      <button onClick={() => onBorrow(book)} className="px-2 py-1 bg-yellow-500 text-black rounded text-sm hover:brightness-90">Borrow</button>
                    )}
                    {book.status === 'Borrowed' && (
                      <button onClick={() => onReturn(book)} className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:brightness-90">Return</button>
                    )}
                    {book.status !== 'Reading' && book.status !== 'Read' && (
                      <button onClick={() => onStartReading(book)} className="px-2 py-1 bg-blue-400 text-white rounded text-sm">Start Reading</button>
                    )}
                    {(book.status === 'Reading' || book.status === 'Borrowed') && (
                      <button onClick={() => onMarkRead(book)} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">Mark Read</button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 border text-xs max-w-xs">
                  {Array.isArray(book.statusHistory) && book.statusHistory.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {book.statusHistory.slice(-4).reverse().map((h, idx) => (
                        <li key={idx}>
                          <strong>{h.status}</strong> — {new Date(h.at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No history</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - unchanged */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {pageItems.length} of {total} books</div>
        <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
      </div>

      {/* Edit modal - unchanged */}
      {editing && (
        <EditBookModal book={editing} onClose={closeEdit} onSaved={onEditSaved} />
      )}
    </div>
  );
}