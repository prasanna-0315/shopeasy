import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { formatCurrency, getErrorMessage, orderApi } from "../services/api";

export default function OrderPage({ success = false, admin = false }) {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order?.id === Number(id)) return;
    let active = true;
    (admin || user?.role === "ADMIN" ? orderApi.getAdmin(id) : orderApi.get(id))
      .then((data) => { if (active) setOrder(data); })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, "We couldn't load this order."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, order?.id, admin, user?.role]);

  if (loading) return <section className="page-wrap"><div className="state-panel"><span className="spinner" /> Loading order…</div></section>;
  if (error || !order) return <section className="page-wrap"><div className="form-alert" role="alert">{error || "Order not found."}</div><Link className="text-link" to="/orders">Back to my orders</Link></section>;

  const address = order.deliveryAddress;
  return (
    <section className="page-wrap">
      <div className={success ? "success-banner" : "page-heading-row"}>
        {success && <span className="success-check">✓</span>}
        <div><p className="eyebrow">{success ? "IT’S ON ITS WAY" : `ORDER #${order.id}`}</p><h1>{success ? "Order placed successfully." : `Order #${order.id}`}</h1>
          {success && <p>Thanks for shopping with ShopEasy. We’ll take it from here.</p>}</div>
      </div>
      <div className="order-detail-layout">
        <div className="order-detail-main">
          <section className="detail-card">
            <div className="detail-card-heading"><h2>Items in your order</h2><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></div>
            {order.items.map((item) => (
              <div className="order-detail-item" key={`${item.productId}-${item.productName}`}>
                <img src={item.imageUrl || "/product-images/electronics.svg"} alt="" />
                <span><strong>{item.productName}</strong><small>Quantity {item.quantity} · {formatCurrency(item.unitPrice)} each</small></span>
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            ))}
          </section>
          <section className="detail-card">
            <h2>Delivery address</h2>
            <address>
              <strong>{address.customerName}</strong><br />{address.building}, {address.street}<br />
              {address.city}, {address.state} {address.pinCode}<br />{address.phone}<br />{address.email}
            </address>
          </section>
        </div>
        <aside className="summary-card">
          <p className="eyebrow">ORDER DETAILS</p>
          <div className="summary-row"><span>Order number</span><strong>#{order.id}</strong></div>
          <div className="summary-row"><span>Placed</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
          <div className="summary-row"><span>Payment</span><strong>{order.paymentMethod} · {order.paymentStatus}</strong></div>
          <div className="summary-row"><span>Delivery</span><strong>{formatCurrency(order.deliveryCharge)}</strong></div>
          <div className="summary-total"><span>Total</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
          <Link className="button button-dark button-wide" to="/">Continue shopping</Link>
          {success && <Link className="button button-outline button-wide order-link" to="/orders">View my orders</Link>}
        </aside>
      </div>
    </section>
  );
}
