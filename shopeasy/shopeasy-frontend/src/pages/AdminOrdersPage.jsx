import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, getErrorMessage, orderApi } from "../services/api";

const nextStatuses = {
  PENDING: ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "DELIVERED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    orderApi.all()
      .then((data) => { if (active) setOrders(data); })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, "You don't have permission to view order management."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await orderApi.updateStatus(id, status);
      setOrders((current) => current.map((order) => order.id === id ? updated : order));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not update order status."));
    }
  };

  return (
    <section className="page-wrap">
      <p className="eyebrow">SHOP MANAGEMENT</p><div className="page-heading-row"><div><h1>Order management</h1><p className="muted">Review customer orders and fulfillment status.</p></div><Link className="text-link" to="/">Back to shop</Link></div>
      {error && <div className="form-alert" role="alert">{error}</div>}
      {loading && <div className="state-panel"><span className="spinner" /> Loading orders…</div>}
      {!loading && !error && orders.length === 0 && <div className="empty-state"><h2>No orders yet.</h2></div>}
      {!loading && orders.length > 0 && (
        <div className="admin-orders">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-heading"><div><p className="eyebrow">ORDER #{order.id}</p><p>{order.deliveryAddress.customerName} · {order.customerEmail}</p><p className="muted">{new Date(order.createdAt).toLocaleString()}</p></div><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></div>
              <p>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(" · ")}</p>
              <div className="order-card-footer"><span>{order.paymentMethod} · {formatCurrency(order.totalAmount)}</span><div className="admin-actions">
                <Link className="text-link" to={`/admin/orders/${order.id}`}>Details</Link>
                {(nextStatuses[order.status] || []).map((status) => <button key={status} className="button button-outline button-small" onClick={() => updateStatus(order.id, status)}>{status === "CANCELLED" ? "Cancel" : `Mark ${status.toLowerCase()}`}</button>)}
              </div></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
