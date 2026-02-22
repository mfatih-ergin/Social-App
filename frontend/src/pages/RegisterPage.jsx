import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `Kayıt Ol / ${import.meta.env.VITE_APP_NAME}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(username, email, password);
      console.log("Kayıt başarılı");

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(
        "Kayıt işlemi başarısız. Bilgileri kontrol edin veya farklı bir email deneyin.",
      );
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
        <h2 className="text-center mb-4">Kayıt Ol</h2>

        {error && (
          <div className="alert alert-danger p-2 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
            Kayıt Ol
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="text-decoration-none">
              Giriş Yap
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
