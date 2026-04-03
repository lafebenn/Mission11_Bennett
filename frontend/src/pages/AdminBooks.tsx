import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import type { Book } from '../types/Book';
import { API_BASE } from '../apiBase';

// AdminBooks page - allows admins to add, edit, and delete books in the database

// Empty book template used to reset the form after submission
const emptyBook: Book = {
  bookId: 0,
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Book>(emptyBook);
  const [saving, setSaving] = useState(false);

  // Determines whether the form is in edit mode or add mode
  const isEditing = form.bookId > 0;

  // Fetch all books from the API and update state
  const loadBooks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/books`);
      if (!res.ok) throw new Error('Failed to load books');
      const data = (await res.json()) as Book[];
      setBooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const resetForm = () => setForm(emptyBook);

  // Populate the form with the selected book's data for editing
  const handleEdit = (b: Book) => {
    setForm({ ...b });
  };

  // Confirm and send delete request, then refresh the list
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/books/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await loadBooks();
      if (form.bookId === id) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  // Submit the form - POST for new books, PUT for edits
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        const res = await fetch(`${API_BASE}/api/books/${form.bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Update failed');
        }
      } else {
        const res = await fetch(`${API_BASE}/api/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, bookId: 0 }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Create failed');
        }
      }
      await loadBooks();
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="alert alert-info mb-0">Loading books…</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">Admin — books</h1>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          {isEditing ? 'Edit book' : 'Add book'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="author">
                Author
              </label>
              <input
                id="author"
                name="author"
                className="form-control"
                value={form.author}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="publisher">
                Publisher
              </label>
              <input
                id="publisher"
                name="publisher"
                className="form-control"
                value={form.publisher}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="isbn">
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                className="form-control"
                value={form.isbn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="classification">
                Classification
              </label>
              <input
                id="classification"
                name="classification"
                className="form-control"
                value={form.classification}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="pageCount">
                Page count
              </label>
              <input
                id="pageCount"
                name="pageCount"
                type="number"
                min={0}
                className="form-control"
                value={form.pageCount || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                className="form-control"
                value={form.price || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : isEditing ? 'Update book' : 'Add book'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded border">
        <table className="table table-striped align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Pages</th>
              <th className="text-end">Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.bookId}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category}</td>
                <td>{b.pageCount}</td>
                <td className="text-end">${b.price.toFixed(2)}</td>
                <td className="text-nowrap text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => void handleDelete(b.bookId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBooks;
