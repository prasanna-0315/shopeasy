import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError("Please complete every field.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (form.password.length > 72) {
      setError("Password must be 72 characters or fewer.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Those passwords don't match yet.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login", {
        replace: true,
        state: { success: response.message || "Your account is ready. Please log in." },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <p className="eyebrow">A BETTER EVERYDAY</p>
        <h1>Find things<br />you’ll <span>love.</span></h1>
        <p>One account for considered finds and an easier checkout.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="eyebrow">GET STARTED</p>
        <h2>Create account</h2>
        <p className="form-intro">It only takes a moment.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="form-field">
          Full name
          <input name="name" autoComplete="name" value={form.name} onChange={update} maxLength={100} required />
        </label>
        <label className="form-field">
          Email address
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={update} maxLength={254} required />
        </label>
        <label className="form-field">
          Password
          <input name="password" type={showPasswords ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={update} minLength={8} required />
        </label>
        <label className="form-field">
          Confirm password
          <span className="password-field">
            <input name="confirmPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={update} required />
            <button type="button" className="password-toggle" onClick={() => setShowPasswords((value) => !value)}>
              {showPasswords ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        <button className="button button-dark button-wide" type="submit" disabled={submitting}>
          {submitting ? <><span className="spinner spinner-light" /> Creating account…</> : "Create account"}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
