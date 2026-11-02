import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success] = useState(location.state?.success || "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Enter both your email address and password.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await login({ email: email.trim(), password });
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, {
        replace: true,
        state: { notice: `Welcome back, ${response.name || "you're signed in"}!` },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't sign you in. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Your next<br />good find is<br /><span>waiting.</span></h1>
        <p>Sign in to pick up right where you left off.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h2>Log in</h2>
        <p className="form-intro">Good to have you back.</p>
        {success && <div className="form-success" role="status">{success}</div>}
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="form-field">
          Email address
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
          />
        </label>
        <label className="form-field">
          Password
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        <button className="button button-dark button-wide" type="submit" disabled={submitting}>
          {submitting ? <><span className="spinner spinner-light" /> Signing in…</> : "Log in"}
        </button>
        <p className="auth-switch">New to ShopEasy? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
