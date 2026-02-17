import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function LoginPage() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const response = await api.get("/auth/me");
      setUser(response.data);

      navigate("/home");
    } catch (err) {
      setError("Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  const handleGuestLogin = () => {
    navigate("/home");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">Giriş Yap</h2>

        {error && (
          <div className="alert alert-danger p-2 text-center">{error}</div>
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
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Giriş Yap
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-decoration-none">
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
          >
            Misafir Olarak Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
