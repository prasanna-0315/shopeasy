import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/useCart";
import { formatCurrency, getErrorMessage, productApi } from "../services/api";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    productApi.get(id)
      .then((data) => { if (active) setResult({ id, product: data }); })
      .catch((requestError) => {
        if (active) setResult({ id, error: getErrorMessage(requestError, "We couldn't find that product.") });
      });
    return () => { active = false; };
  }, [id]);

  if (result?.id === id && result.error) return <section className="page-wrap"><div className="state-panel state-error">{result.error}</div><Link className="text-link" to="/">Back to the collection</Link></section>;
  const product = result?.id === id ? result.product : null;
  if (!product) return <section className="page-wrap"><div className="state-panel"><span className="spinner" /> Loading product…</div></section>;

  const add = () => setNotice(addItem(product) || `${product.name} added to your cart.`);
  return (
    <section className="page-wrap">
      <p className="breadcrumbs"><Link to="/">Shop</Link><span>/</span>{product.category}<span>/</span>{product.name}</p>
      {notice && <div className="toast-message inline-toast" role="status">{notice}</div>}
      <div className="product-detail">
        <div className="detail-visual"><img src={product.imageUrl || "/product-images/electronics.svg"} alt={product.name} /></div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatCurrency(product.price)}</p>
          <p className="detail-description">{product.description || "A considered pick for your everyday."}</p>
          <p className={product.stock > 0 ? "stock-copy" : "stock-copy out-of-stock"}>
            {product.stock > 0 ? `${product.stock} available` : "Currently out of stock"}
          </p>
          <button className="button button-dark" onClick={add} disabled={product.stock <= 0}>
            {product.stock > 0 ? "Add to cart" : "Out of stock"}
          </button>
          <p className="detail-note">Secure checkout · Cash on delivery available</p>
        </div>
      </div>
    </section>
  );
}
