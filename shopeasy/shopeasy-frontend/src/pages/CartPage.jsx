import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { formatCurrency } from "../services/api";

export default function CartPage() {
  const { items, itemCount, subtotal, setQuantity, removeItem } = useCart();
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  return (
    <section className="page-wrap">
      <p className="eyebrow">YOUR EDIT</p>
      <div className="page-heading-row"><div><h1>Your cart</h1><p className="muted">{itemCount} {itemCount === 1 ? "item" : "items"}</p></div><Link className="text-link" to="/">← Keep shopping</Link></div>
      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">▱</span><h2>Your cart is taking a breather.</h2><p>Find something lovely to bring home.</p><Link className="button button-dark" to="/">Explore the collection</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-line" key={item.id}>
                <Link to={`/products/${item.id}`} className="cart-image"><img src={item.imageUrl || "/product-images/electronics.svg"} alt={item.name} /></Link>
                <div className="cart-line-info">
                  <p className="product-category">{item.category}</p>
                  <Link className="product-title" to={`/products/${item.id}`}>{item.name}</Link>
                  <p className="muted">{formatCurrency(item.price)} each</p>
                  <div className="cart-line-actions">
                    <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase quantity">+</button>
                    </div>
                    <button className="remove-link" type="button" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
                <strong className="cart-line-total">{formatCurrency(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary-card">
            <p className="eyebrow">THE TOTAL</p><h2>Order summary</h2>
            <div className="summary-row"><span>Subtotal · {itemCount} items</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="summary-row"><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatCurrency(delivery)}</strong></div>
            {subtotal < 999 && <p className="delivery-hint">Free delivery on orders over ₹999.</p>}
            <div className="summary-total"><span>Total</span><strong>{formatCurrency(subtotal + delivery)}</strong></div>
            <Link to="/checkout" className="button button-dark button-wide">Proceed to checkout</Link>
            <p className="secure-note">Secure checkout · Prices confirmed at order placement</p>
          </aside>
        </div>
      )}
    </section>
  );
}
