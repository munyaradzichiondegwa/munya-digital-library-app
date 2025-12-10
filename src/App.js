import React, { useState } from 'react';
import BookList from './components/BookList.js';  // Added .js extension
import AddBookForm from './components/AddBookForm.js';  // Added .js extension
import './index.css';

function App() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // For re-renders

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Biography', 'Sci-Fi', 'Mystery'];

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Digital Library</h1>
        <p className="text-gray-700 mt-2">Manage your books easily with Firebase</p>
      </header>

      <main className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex items-center gap-4">
          <label className="font-semibold">Filter by Genre:</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <AddBookForm onAdded={handleRefresh} />
        <BookList genre={selectedGenre === 'All' ? null : selectedGenre} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;