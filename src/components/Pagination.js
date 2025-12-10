// src/components/Pagination.js
// Minimal pagination control used by BookList

import React from 'react';

export default function Pagination({ page, totalPages, onChange }) {
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
      <div className="text-sm">Page {page} / {totalPages}</div>
      <button onClick={next} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
    </div>
  );
}
