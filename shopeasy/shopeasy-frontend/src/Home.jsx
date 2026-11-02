import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "./context/useCart";
import { formatCurrency, getErrorMessage, productApi } from "./services/api";

const fallbackImage = "/product-images/electronics.svg";

export default function Home() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    productApi.list()
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(
          requestError,
          "Couldn't connect to the product catalog. Start the ShopEasy backend and refresh this page.",
        ));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = !normalizedQuery
        || `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, query, category, sort]);

  const handleAdd = (product) => {
    const result = addItem(product);
    setNotice(result || `${product.name} added to your cart.`);
  };

  return (
    <>
      {notice && <div className="toast-message" role="status">{notice}</div>}
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">THE EVERYDAY EDIT · SHOPEASY</p>
          <h1>Good things,<br /><span>thoughtfully found.</span></h1>
          <p>Useful little upgrades, considered essentials, and a few things you didn’t know you needed.</p>
          <a className="button button-dark" href="#catalog">Explore the collection <span aria-hidden="true">↘</span></a>
          <div className="hero-proof"><span>✦</span> A better kind of everyday shopping</div>
        </div>
        <div className="hero-art">
          <img src="/product-images/home-kitchen.svg" alt="" />
          <div className="hero-note"><span>New season</span><strong>Find your next favorite.</strong></div>
        </div>
        <div className="hero-index">01 <span>/</span> 05</div>
      </section>

      <section className="category-strip" aria-label="Shop by category">
        <div>
          <p className="eyebrow">A LITTLE BIT OF EVERYTHING</p>
          <h2>Shop by category</h2>
        </div>
        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-chip${category === item ? " active" : ""}`}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">MADE FOR YOUR EVERYDAY</p>
            <h2>{category === "All" ? "The collection" : category}</h2>
            <p className="muted">{filteredProducts.length} finds, ready when you are.</p>
          </div>
          <div className="catalog-controls">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search the collection"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search products"
              />
            </label>
            <label className="sort-field">
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <div className="state-panel"><span className="spinner" /> Loading thoughtful finds…</div>}
        {!loading && error && <div className="state-panel state-error" role="alert">{error}</div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="state-panel">Nothing matched that search. Try another word or category.</div>
        )}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article className="product-card" key={product.id}>
                <Link className="product-visual" to={`/products/${product.id}`}>
                  <img
                    src={product.imageUrl || fallbackImage}
                    alt={product.name}
                    loading={index > 5 ? "lazy" : "eager"}
                    onError={(event) => { event.currentTarget.src = fallbackImage; }}
                  />
                  <span className={`stock-badge${product.stock <= 0 ? " unavailable" : ""}`}>
                    {product.stock > 0 ? "In stock" : "Sold out"}
                  </span>
                </Link>
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <Link className="product-title" to={`/products/${product.id}`}>{product.name}</Link>
                  <p className="product-description">{product.description}</p>
                  <div className="product-buy-row">
                    <strong>{formatCurrency(product.price)}</strong>
                    <button
                      type="button"
                      className="add-button"
                      onClick={() => handleAdd(product)}
                      disabled={product.stock <= 0}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {product.stock > 0 ? "+" : "—"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="promise-band">
        <span>Thoughtful picks</span><span>Secure checkout</span><span>Easy order tracking</span>
      </section>
    </>
  );
}
