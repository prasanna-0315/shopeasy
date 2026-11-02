import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

export default function StoreLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="store-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="ShopEasy home">
          <span className="brand-mark">s</span>
          <span>shop<span className="brand-accent">easy</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/">Shop</NavLink>
          {isAuthenticated && <NavLink to="/orders">My orders</NavLink>}
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/products">Add products</NavLink>
              <NavLink to="/admin/orders">Orders</NavLink>
            </>
          )}
        </nav>
        <div className="header-actions">
          <Link className="cart-link" to="/cart" aria-label={`Cart, ${itemCount} items`}>
            <span aria-hidden="true">▱</span> Cart <span className="cart-count">{itemCount}</span>
          </Link>
          {isAuthenticated ? (
            <div className="account-actions">
              <span className="welcome-user">Hi, {user.name?.split(" ")[0] || "there"}</span>
              <button className="button button-outline button-small" onClick={logout}>Log out</button>
            </div>
          ) : (
            <div className="account-actions">
              <Link className="text-link" to="/login">Log in</Link>
              <Link className="button button-dark button-small" to="/register">Create account</Link>
            </div>
          )}
        </div>
      </header>
      <main className="site-main"><Outlet /></main>
      <footer className="site-footer">
        <Link className="brand brand-footer" to="/"><span className="brand-mark">s</span><span>shop<span className="brand-accent">easy</span></span></Link>
        <p>Considered finds for everyday living.</p>
        <span>© {new Date().getFullYear()} ShopEasy</span>
      </footer>
    </div>
  );
}
