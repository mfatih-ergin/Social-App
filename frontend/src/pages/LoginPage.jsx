import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const origin = location.state?.from?.pathname || "/";

  useEffect(() => {
    document.title = `Giriş Yap / ${import.meta.env.VITE_APP_NAME}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(origin, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Giriş başarısız. Bilgilerinizi kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigate("/");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Giriş Yap</h2>

        {error && (
          <div className="alert alert-danger p-2 text-center small">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
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

        <hr className="my-4" />

        <div className="d-grid">
          <button
            onClick={handleGuestLogin}
            className="btn btn-outline-secondary"
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
