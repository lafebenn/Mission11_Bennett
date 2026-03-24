import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import type { Book } from './types/Book';
import { useCart } from './context/CartContext';

const API_BASE = 'http://localhost:5039';

function useBookListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const category = searchParams.get('category') ?? '';
  const pageSizeRaw = searchParams.get('pageSize') ?? '5';
  const pageSizeAll = pageSizeRaw === 'all';
  const pageSizeNum = pageSizeAll
    ? 0
    : Math.max(1, Number(pageSizeRaw) || 5);
  const sortAscending = (searchParams.get('sort') ?? 'asc') !== 'desc';

  const setQuery = (updates: Record<string, string | number | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      return next;
    });
  };

  return {
    page,
    category,
    pageSizeAll,
    pageSizeNum,
    sortAscending,
    setQuery,
  };
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const {
    page: currentPage,
    category: selectedCategory,
    pageSizeAll,
    pageSizeNum,
    sortAscending,
    setQuery,
  } = useBookListQuery();

  const { lines, itemCount, grandTotal, addToCart, saveContinueShoppingPath } =
    useCart();

  useEffect(() => {
    saveContinueShoppingPath(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search, saveContinueShoppingPath]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/books`);
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = (await response.json()) as Book[];
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

  useEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    bootstrap.Toast.getOrCreateInstance(el, { delay: 2800 });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      if (b.category) set.add(b.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (!selectedCategory) return books;
    return books.filter((b) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) =>
      sortAscending
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );
  }, [filteredBooks, sortAscending]);

  const effectivePageSize = pageSizeAll
    ? Math.max(sortedBooks.length, 1)
    : pageSizeNum;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedBooks.length / effectivePageSize)
  );

  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastBook = safePage * effectivePageSize;
  const indexOfFirstBook = indexOfLastBook - effectivePageSize;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  useEffect(() => {
    if (currentPage !== safePage) {
      setQuery({ page: safePage });
    }
  }, [currentPage, safePage, setQuery]);

  const showAddedToast = () => {
    const el = toastRef.current;
    if (el) bootstrap.Toast.getOrCreateInstance(el).show();
  };

  const handleAddToCart = (book: Book) => {
    addToCart(book, 1);
    showAddedToast();
  };

  const cartSummaryBody =
    lines.length === 0 ? (
      <p className="text-muted small mb-0">No items yet.</p>
    ) : (
      <ul className="list-group list-group-flush small">
        {lines.map((line) => (
          <li
            key={line.bookId}
            className="list-group-item d-flex justify-content-between align-items-start px-0 bg-transparent"
          >
            <div className="me-2 text-start">
              <div className="fw-medium">{line.title}</div>
              <div className="text-muted">
                Qty {line.quantity} × ${line.price.toFixed(2)}
              </div>
            </div>
            <span className="fw-semibold text-nowrap">
              ${(line.quantity * line.price).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          aria-label="Loading"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mb-0">Loading books…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}. Make sure the API is running on port
          5039.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-12 col-lg-8 order-2 order-lg-1">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h1 className="h2 mb-0 text-start">Online Bookstore</h1>
              <button
                className="btn btn-outline-secondary d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
              >
                Cart ({itemCount})
              </button>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="categoryFilter" className="form-label mb-1">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) =>
                    setQuery({ category: e.target.value, page: 1 })
                  }
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="pageSize" className="form-label mb-1">
                  Results per page
                </label>
                <select
                  id="pageSize"
                  className="form-select"
                  value={pageSizeAll ? 'all' : String(pageSizeNum)}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'all') {
                      setQuery({ pageSize: 'all', page: 1 });
                    } else {
                      setQuery({ pageSize: Number(v), page: 1 });
                    }
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  onClick={() =>
                    setQuery({ sort: sortAscending ? 'desc' : 'asc', page: 1 })
                  }
                >
                  Sort by title ({sortAscending ? 'A–Z' : 'Z–A'})
                </button>
              </div>
            </div>

            <p className="text-muted small text-start mb-3">
              Showing {sortedBooks.length === 0 ? 0 : indexOfFirstBook + 1}–
              {Math.min(indexOfLastBook, sortedBooks.length)} of{' '}
              {sortedBooks.length}
              {selectedCategory ? ` in “${selectedCategory}”` : ''}.
            </p>

            <div className="table-responsive shadow-sm rounded border">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Author</th>
                    <th scope="col">Publisher</th>
                    <th scope="col">ISBN</th>
                    <th scope="col">Classification / Category</th>
                    <th scope="col">Pages</th>
                    <th scope="col" className="text-end">
                      Price
                    </th>
                    <th scope="col" className="text-center">
                      Cart
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.map((b) => (
                    <tr key={b.bookId}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.publisher}</td>
                      <td>{b.isbn}</td>
                      <td>
                        {b.classification} / {b.category}
                      </td>
                      <td>{b.pageCount}</td>
                      <td className="text-end">${b.price.toFixed(2)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleAddToCart(b)}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav aria-label="Book pagination" className="mt-3">
              <ul className="pagination justify-content-center flex-wrap mb-0">
                <li
                  className={`page-item ${safePage === 1 ? 'disabled' : ''}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setQuery({ page: safePage - 1 })}
                    disabled={safePage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <li
                      key={pageNum}
                      className={`page-item ${safePage === pageNum ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setQuery({ page: pageNum })}
                        aria-current={safePage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setQuery({ page: safePage + 1 })}
                    disabled={safePage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <aside className="col-12 col-lg-4 order-1 order-lg-2">
            <div className="card shadow-sm border-primary sticky-lg-top">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Cart summary</span>
                <span className="badge text-bg-light text-primary">
                  {itemCount} items
                </span>
              </div>
              <div className="card-body text-start">{cartSummaryBody}</div>
              <div className="card-footer bg-transparent">
                <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                <Link to="/cart" className="btn btn-primary w-100">
                  View full cart
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="cartOffcanvas"
        aria-labelledby="cartOffcanvasLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="cartOffcanvasLabel">
            Your cart
          </h2>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body text-start">
          {cartSummaryBody}
          <div className="mt-3 pt-3 border-top d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <Link
            to="/cart"
            className="btn btn-primary w-100 mt-3"
            data-bs-dismiss="offcanvas"
          >
            View full cart
          </Link>
        </div>
      </div>

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          ref={toastRef}
          className="toast"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Bookstore</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            />
          </div>
          <div className="toast-body">Added to your cart.</div>
        </div>
      </div>
    </>
  );
};

export default BookList;
