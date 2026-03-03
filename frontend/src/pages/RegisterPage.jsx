import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { validateForm } from "../utils/validation";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeField, setActiveField] = useState(null);

  const userChecks = {
    length: username.length >= 3 && username.length <= 20,
    format: /^[a-zA-Z0-9_]+$/.test(username),
  };

  const emailChecks = {
    format: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/.test(email),
    validEnd: /\.(com|net|org|edu|gov|info|me|com\.tr|org\.tr|edu\.tr)$/i.test(
      email,
    ),
  };

  const passChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(username, email, password);
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      await register(username, email, password);
      navigate("/home");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Kayıt işlemi başarısız.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => navigate("/home");

  const renderCheckItem = (isMet, text) => (
    <div
      className={`d-flex align-items-center mb-1 ${isMet ? "text-success" : "text-danger"}`}
      style={{ fontSize: "0.68rem" }}
    >
      <i
        className={`bi ${isMet ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-1`}
      ></i>
      <span className="fw-bold">{text}</span>
    </div>
  );

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-3 shadow border-0"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-3 fw-bold">Kayıt Ol</h3>

        {error && (
          <div className="alert alert-danger p-2 text-center small mb-2 animate__animated animate__shakeX">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small fw-bold text-secondary mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              className={`form-control form-control-sm ${username.length > 0 && (Object.values(userChecks).every((v) => v) ? "is-valid" : "is-invalid")}`}
              value={username}
              onFocus={() => setActiveField("username")}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            {activeField === "username" && (
              <div className="mt-2 p-2 bg-light rounded border shadow-sm">
                <div className="row g-0">
                  <div className="col-6">
                    {renderCheckItem(userChecks.length, "3-20 Karakter")}
                  </div>
                  <div className="col-6">
                    {renderCheckItem(userChecks.format, "Harf, Rakam, __")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-secondary mb-1">
              Email Adresi
            </label>
            <input
              type="email"
              className={`form-control form-control-sm ${email.length > 0 && (Object.values(emailChecks).every((v) => v) ? "is-valid" : "is-invalid")}`}
              value={email}
              onFocus={() => setActiveField("email")}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            {activeField === "email" && (
              <div className="mt-2 p-2 bg-light rounded border shadow-sm">
                <div className="row g-0">
                  <div className="col-6">
                    {renderCheckItem(emailChecks.format, "Geçerli Format")}
                  </div>
                  <div className="col-6">
                    {renderCheckItem(emailChecks.validEnd, "Bilinen Uzantı")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-secondary mb-1">
              Şifre
            </label>
            <input
              type="password"
              className={`form-control form-control-sm ${password.length > 0 && (Object.values(passChecks).every((v) => v) ? "is-valid" : "is-invalid")}`}
              value={password}
              onFocus={() => setActiveField("password")}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {activeField === "password" && (
              <div className="mt-2 p-2 bg-light rounded border shadow-sm">
                <p
                  className="fw-bold mb-1"
                  style={{ fontSize: "0.65rem", color: "#666" }}
                >
                  Gereksinimler:
                </p>
                <div className="row g-0">
                  <div className="col-6">
                    {renderCheckItem(passChecks.length, "8+ Karakter")}
                  </div>
                  <div className="col-6">
                    {renderCheckItem(passChecks.upper, "Büyük Harf")}
                  </div>
                  <div className="col-6">
                    {renderCheckItem(passChecks.lower, "Küçük Harf")}
                  </div>
                  <div className="col-6">
                    {renderCheckItem(passChecks.number, "Rakam")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold py-2 mt-2"
            disabled={
              loading ||
              !Object.values(passChecks).every((v) => v) ||
              !Object.values(userChecks).every((v) => v) ||
              !Object.values(emailChecks).every((v) => v)
            }
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </form>

        <div className="text-center mt-2">
          <small className="text-muted">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="text-decoration-none fw-bold">
              {" "}
              Giriş Yap{" "}
            </Link>
          </small>
        </div>

        <hr className="my-3" />

        <div className="d-grid">
          <button
            onClick={handleGuestLogin}
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
