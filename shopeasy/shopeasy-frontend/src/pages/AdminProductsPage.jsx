import { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage, productApi } from "../services/api";

const initialProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  stock: "",
};

export default function AdminProductsPage() {
  const [product, setProduct] = useState(initialProduct);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    setProduct((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const created = await productApi.create({
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      });
      setProduct(initialProduct);
      setSuccess(`${created.name} was added to the catalog.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't add this product. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-wrap">
      <p className="eyebrow">SHOP MANAGEMENT</p>
      <div className="page-heading-row">
        <div>
          <h1>Add a product</h1>
          <p className="muted">Add a new find to the ShopEasy catalog.</p>
        </div>
        <Link className="text-link" to="/admin/orders">Order management</Link>
      </div>

      <form className="admin-product-form form-section" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <span>01</span>
          <div><h2>Product details</h2><p>Products are available in the shop as soon as they’re saved.</p></div>
        </div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {success && <div className="form-success" role="status">{success}</div>}
        <div className="form-grid">
          <label className="form-field field-span">
            Product name
            <input name="name" value={product.name} onChange={update} maxLength={255} required />
          </label>
          <label className="form-field">
            Category
            <input name="category" value={product.category} onChange={update} maxLength={100} placeholder="e.g. Electronics" required />
          </label>
          <label className="form-field">
            Price (INR)
            <input name="price" type="number" min="0.01" step="0.01" value={product.price} onChange={update} required />
          </label>
          <label className="form-field">
            Stock quantity
            <input name="stock" type="number" min="0" step="1" value={product.stock} onChange={update} required />
          </label>
          <label className="form-field">
            Image URL or path <span className="muted">(optional)</span>
            <input name="imageUrl" value={product.imageUrl} onChange={update} maxLength={255} placeholder="/product-images/electronics.svg" />
          </label>
          <label className="form-field field-span">
            Description
            <textarea name="description" rows="4" value={product.description} onChange={update} maxLength={255} required />
          </label>
        </div>
        <button className="button button-dark" type="submit" disabled={submitting}>
          {submitting ? <><span className="spinner spinner-light" /> Adding product…</> : "Add product"}
        </button>
      </form>
    </section>
  );
}
