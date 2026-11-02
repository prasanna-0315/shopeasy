import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, getErrorMessage, orderApi } from "../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      setOrders(await orderApi.mine());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't load your orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    orderApi.mine()
      .then((data) => { if (active) setOrders(data); })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, "We couldn't load your orders."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this pending order?")) return;
    setError("");
    try {
      await orderApi.cancel(id);
      setNotice(`Order #${id} was cancelled and its stock was restored.`);
      await loadOrders();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't cancel this order."));
    }
  };

  return (
    <section className="page-wrap">
      <p className="eyebrow">YOUR SHOPPING HISTORY</p>
      <div className="page-heading-row"><div><h1>My orders</h1><p className="muted">Every good find, all in one place.</p></div><Link className="text-link" to="/">Continue shopping →</Link></div>
      {notice && <div className="form-success" role="status">{notice}</div>}
      {error && <div className="form-alert" role="alert">{error}</div>}
      {loading && <div className="state-panel"><span className="spinner" /> Loading your orders…</div>}
      {!loading && !error && orders.length === 0 && <div className="empty-state"><h2>No orders just yet.</h2><p>Your next favorite is waiting in the collection.</p><Link className="button button-dark" to="/">Browse the collection</Link></div>}
      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-heading">
                <div><p className="eyebrow">ORDER #{order.id}</p><p className="muted">{new Date(order.createdAt).toLocaleString()}</p></div>
                <span className={`status-pill status-${order.status?.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-product-list">
                {order.items.map((item) => <span key={`${order.id}-${item.productId}`}>{item.productName} <small>× {item.quantity}</small></span>)}
              </div>
              <div className="order-card-footer">
                <span>{order.paymentMethod} · {formatCurrency(order.totalAmount)}</span>
                <div><Link className="text-link" to={`/orders/${order.id}`}>View details</Link>
                  {order.status === "PENDING" && <button className="remove-link" onClick={() => cancel(order.id)}>Cancel order</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
