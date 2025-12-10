import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Toastify styles
import BookList from './components/BookList.js';
import AddBookForm from './components/AddBookForm.js';
import AuthForm from './components/AuthForm.js';  // New import
import { onAuthChange, logOut, getCurrentUser } from './services/auth.js';  // New import
import './index.css';

function App() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState(null);  // New: Auth state
  const [showAuth, setShowAuth] = useState(true);  // New: Show auth modal initially

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Biography', 'Sci-Fi', 'Mystery'];

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // New: Listen to auth state changes
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (u) {
        setShowAuth(false);  // Hide modal on login
        console.log('User logged in:', u.email);
      } else {
        setShowAuth(true);  // Show modal if logged out
      }
    });
    // Check initial state
    if (getCurrentUser()) {
      setUser(getCurrentUser());
      setShowAuth(false);
    }
    return () => unsub();
  }, []);

  const handleLogout = () => {
    logOut();
    setShowAuth(true);  // Show login after logout
  };

  if (showAuth && !user) {
    return <AuthForm onLogin={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Digital Library</h1>
        <p className="text-gray-700 mt-2">Manage your books easily with Firebase</p>
      </header>

      <main className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* New: User info and logout */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Welcome, {user?.email || 'User'}!</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </div>

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

      {/* New: Global toast container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default App;