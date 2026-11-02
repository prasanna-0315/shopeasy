import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { formatCurrency, getErrorMessage, orderApi } from "../services/api";

const initialAddress = {
  customerName: "",
  email: "",
  phone: "",
  building: "",
  street: "",
  city: "",
  state: "",
  pinCode: "",
};

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(() => ({
    ...initialAddress,
    customerName: user?.name || "",
    email: user?.email || "",
  }));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  const update = (event) => setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (items.length === 0) {
      setError("Your cart is empty. Add an item before checking out.");
      return;
    }
    if (Object.values(address).some((value) => !value.trim())) {
      setError("Please complete every delivery field.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!/^[0-9+() -]{7,20}$/.test(address.phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!/^[0-9]{6}$/.test(address.pinCode)) {
      setError("Enter a 6-digit PIN code.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderApi.place({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        address,
        paymentMethod: "COD",
      });
      clearCart();
      navigate(`/orders/success/${order.id}`, { replace: true, state: { order } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't place your order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return <section className="page-wrap"><div className="empty-state"><h1>Your cart is empty</h1><p>Add something to your cart before checking out.</p><Link className="button button-dark" to="/">Browse the collection</Link></div></section>;
  }

  return (
    <section className="page-wrap">
      <p className="eyebrow">ALMOST YOURS</p><h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <div className="form-section-heading"><span>01</span><div><h2>Delivery details</h2><p>Where should we send your order?</p></div></div>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <div className="form-grid">
              <label className="form-field">Full name<input name="customerName" autoComplete="name" value={address.customerName} onChange={update} required /></label>
              <label className="form-field">Email<input name="email" type="email" autoComplete="email" value={address.email} onChange={update} required /></label>
              <label className="form-field">Phone number<input name="phone" type="tel" autoComplete="tel" value={address.phone} onChange={update} required /></label>
              <label className="form-field">House / building<input name="building" autoComplete="address-line1" value={address.building} onChange={update} required /></label>
              <label className="form-field field-span">Street / area<input name="street" autoComplete="address-line2" value={address.street} onChange={update} required /></label>
              <label className="form-field">City<input name="city" autoComplete="address-level2" value={address.city} onChange={update} required /></label>
              <label className="form-field">State<input name="state" autoComplete="address-level1" value={address.state} onChange={update} required /></label>
              <label className="form-field">PIN code<input name="pinCode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={address.pinCode} onChange={update} required /></label>
            </div>
          </section>
          <section className="form-section">
            <div className="form-section-heading"><span>02</span><div><h2>Payment</h2><p>Simple, secure, and straightforward.</p></div></div>
            <label className="payment-option">
              <input type="radio" name="payment" value="COD" checked readOnly />
              <span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
              <span className="payment-tag">AVAILABLE</span>
            </label>
            <p className="muted payment-note">Online payment isn’t available yet; we’ll only offer it once a payment gateway is connected.</p>
          </section>
          <button className="button button-dark button-wide place-order-button" type="submit" disabled={submitting}>
            {submitting ? <><span className="spinner spinner-light" /> Placing your order…</> : `Place order · ${formatCurrency(subtotal + delivery)}`}
          </button>
        </form>

        <aside className="summary-card checkout-summary">
          <p className="eyebrow">YOUR ORDER</p><h2>Order summary</h2>
          <div className="checkout-items">
            {items.map((item) => (
              <div className="checkout-item" key={item.id}>
                <img src={item.imageUrl || "/product-images/electronics.svg"} alt="" />
                <span><strong>{item.name}</strong><small>Qty {item.quantity} · {formatCurrency(item.price)} each</small></span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="summary-row"><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatCurrency(delivery)}</strong></div>
          <div className="summary-total"><span>Total due</span><strong>{formatCurrency(subtotal + delivery)}</strong></div>
        </aside>
      </div>
    </section>
  );
}
