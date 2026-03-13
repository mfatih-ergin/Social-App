import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const origin = location.state?.from || "/";

  const isEmailValid =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/.test(email) &&
    /\.(com|net|org|edu|gov|info|me|com\.tr|org\.tr|edu\.tr)$/i.test(email);

  const isPasswordLongEnough = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      navigate(origin, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-3 shadow border-0"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-3 fw-bold">Giriş Yap</h3>

        {error && (
          <div className="alert alert-danger p-2 text-center small mb-3 animate__animated animate__shakeX">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <label className="form-label small fw-bold text-secondary mb-1 d-flex justify-content-between">
              Email Adresi
              {email.length > 0 && (
                <span
                  className={isEmailValid ? "text-success" : "text-danger"}
                  style={{ fontSize: "0.7rem" }}
                >
                  {isEmailValid ? "Geçerli format" : "Geçersiz format"}
                </span>
              )}
            </label>
            <div className="input-group">
              <input
                type="email"
                className={`form-control form-control-sm ${email.length > 0 ? (isEmailValid ? "is-valid" : "is-invalid") : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary mb-1 d-flex justify-content-between">
              Şifre
              {password.length > 0 && !isPasswordLongEnough && (
                <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                  En az 8 karakter olmalı
                </span>
              )}
            </label>
            <input
              type="password"
              className={`form-control form-control-sm ${password.length > 0 ? (isPasswordLongEnough ? "is-valid" : "") : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold py-2 mt-2 shadow-sm"
            disabled={loading || !isEmailValid || password.length === 0}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-decoration-none fw-bold">
              Kayıt Ol
            </Link>
          </small>
        </div>

        <hr className="my-3 opacity-25" />

        <div className="d-grid">
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-secondary btn-sm"
            type="button"
            disabled={loading}
          >
            Misafir Olarak Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
