import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    lines,
    grandTotal,
    setLineQuantity,
    removeLine,
    getContinueShoppingPath,
  } = useCart();

  const continueShopping = () => {
    navigate(getContinueShoppingPath());
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-0">Shopping cart</h1>
          <p className="text-muted small mb-0">
            Your cart is kept for this browser session.
          </p>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="alert alert-secondary" role="status">
              Your cart is empty.
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={continueShopping}
            >
              Continue shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="table-responsive shadow-sm rounded border">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col" className="text-end">
                      Price
                    </th>
                    <th scope="col" className="text-center">
                      Qty
                    </th>
                    <th scope="col" className="text-end">
                      Subtotal
                    </th>
                    <th scope="col">
                      <span className="visually-hidden">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const subtotal = line.quantity * line.price;
                    return (
                      <tr key={line.bookId}>
                        <td>
                          <div className="fw-medium">{line.title}</div>
                          <div className="small text-muted">{line.author}</div>
                        </td>
                        <td className="text-end">${line.price.toFixed(2)}</td>
                        <td className="text-center" style={{ minWidth: '7rem' }}>
                          <input
                            type="number"
                            className="form-control form-control-sm mx-auto"
                            style={{ maxWidth: '5rem' }}
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              setLineQuantity(
                                line.bookId,
                                Number(e.target.value) || 1
                              )
                            }
                            aria-label={`Quantity for ${line.title}`}
                          />
                        </td>
                        <td className="text-end fw-semibold">
                          ${subtotal.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeLine(line.bookId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-primary shadow-sm">
              <div className="card-header bg-primary text-white">Order total</div>
              <div className="card-body">
                <p className="d-flex justify-content-between mb-2">
                  <span>Items</span>
                  <span>
                    {lines.reduce((n, l) => n + l.quantity, 0)}
                  </span>
                </p>
                <p className="d-flex justify-content-between fs-5 fw-bold mb-0">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </p>
              </div>
              <div className="card-footer bg-transparent d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={continueShopping}
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
