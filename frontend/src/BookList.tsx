import { useEffect, useState } from 'react';
import type { Book } from './types/Book';

const API_BASE = 'http://localhost:5039';

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state - 5 books per page by default
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Sorting state - ascending (A-Z) by default
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/books`);
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load books');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // --- 1. SORTING LOGIC ---
  // Make a copy of the books array and sort it based on the title
  const sortedBooks = [...books].sort((a, b) => {
    if (sortAscending) {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  // --- 2. PAGINATION LOGIC ---
  const effectivePageSize = pageSize > 0 ? pageSize : 1;
  const indexOfLastBook = currentPage * effectivePageSize;
  const indexOfFirstBook = indexOfLastBook - effectivePageSize;

  // Slice out only the books for the current page
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  // Calculate total pages - dynamically based on dataset size
  const totalPages = Math.max(1, Math.ceil(books.length / effectivePageSize));

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}. Make sure the API is running on port 5039.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Online Bookstore Inventory</h1>

      {/* Controls for Sorting and Page Size */}
      <div className="d-flex justify-content-between mb-3">
        <div>
          <label className="me-2">Results per page:</label>
          <select 
            className="form-select d-inline-block w-auto" 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to page 1 when changing size
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={books.length || 999}>All</option>
          </select>
        </div>
        
        <button 
          className="btn btn-outline-primary" 
          onClick={() => setSortAscending(!sortAscending)}
        >
          Sort by Title ({sortAscending ? 'A-Z' : 'Z-A'})
        </button>
      </div>

      {/* The Book Table */}
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>ISBN</th>
            <th>Classification / Category</th>
            <th>Pages</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {currentBooks.map((b) => (
            <tr key={b.bookId}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.publisher}</td>
              <td>{b.isbn}</td>
              <td>{b.classification} / {b.category}</td>
              <td>{b.pageCount}</td>
              <td>${b.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dynamic Pagination - builds page links based on total items */}
      <nav aria-label="Book pagination" className="mt-3">
        <ul className="pagination justify-content-center flex-wrap">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <li
              key={pageNum}
              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default BookList;