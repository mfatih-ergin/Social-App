import { useState, useEffect } from "react";
import {
  updateUserSettings,
  deleteUserAccount,
  updateUsername,
  updatePassword,
} from "../api/user.api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [activeDetail, setActiveDetail] = useState("main");
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    setStatus({ type: "", msg: "" });
  }, [activeDetail, activeTab]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!newUsername.trim()) {
      return setStatus({ type: "error", msg: "Kullanıcı adı boş olamaz." });
    }
    if (newUsername.length < 3) {
      return setStatus({
        type: "error",
        msg: "Kullanıcı adı en az 3 karakter olmalıdır.",
      });
    }
    if (newUsername.length > 20) {
      return setStatus({
        type: "error",
        msg: "Kullanıcı adı en fazla 20 karakter olabilir.",
      });
    }
    if (!usernameRegex.test(newUsername)) {
      return setStatus({
        type: "error",
        msg: "Kullanıcı adı sadece harf, rakam ve alt çizgi içermelidir.",
      });
    }
    try {
      setLoading(true);
      await updateUsername({ username: newUsername });
      setUser({ ...user, username: newUsername });
      setStatus({ type: "success", msg: "Kullanıcı adı güncellendi." });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passData.currentPassword || !passData.newPassword) {
      return setStatus({ type: "error", msg: "Lütfen tüm alanları doldurun." });
    }

    if (passData.newPassword.length < 8) {
      return setStatus({
        type: "error",
        msg: "Yeni şifre en az 8 karakter olmalıdır.",
      });
    }

    if (passData.newPassword === passData.currentPassword) {
      return setStatus({
        type: "error",
        msg: "Yeni şifre mevcut şifre ile aynı olamaz.",
      });
    }

    try {
      setLoading(true);
      await updatePassword(passData);
      setPassData({ currentPassword: "", newPassword: "" });
      setStatus({ type: "success", msg: "Şifre başarıyla değiştirildi." });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?",
      )
    ) {
      try {
        setLoading(true);
        await deleteUserAccount(user?._id || user?.id);
        navigate("/", { replace: true });
        logout();
      } catch (error) {
        setStatus({ type: "error", msg: "Silme işlemi başarısız." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (loading || theme === newTheme) return;

    try {
      setLoading(true);
      await updateUserSettings(newTheme);
      toggleTheme(newTheme);
      setUser((prevUser) => ({
        ...prevUser,
        settings: {
          ...prevUser.settings,
          theme: newTheme,
        },
      }));
    } catch (error) {
      console.error("Tema güncellenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`settings-page-wrapper ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      <div className="settings-layout-container">
        <div className="settings-sidebar-nav">
          <div className="settings-main-header">
            <h4 className="fw-bold mb-0">Ayarlar</h4>
            <p className="text-secondary small mb-0 mt-1 invisible-spacer">
              Hizalama Ayarı
            </p>
          </div>
          <div className="settings-nav-list">
            <div
              className={`nav-item-row ${activeTab === "account" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("account");
                setActiveDetail("main");
              }}
            >
              <span>Hesabın</span>
              <i className="bi bi-chevron-right"></i>
            </div>
            <div
              className={`nav-item-row ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("appearance");
                setActiveDetail("main");
              }}
            >
              <span>Görünüm</span>
              <i className="bi bi-chevron-right"></i>
            </div>
          </div>
        </div>

        <div className="settings-detail-content">
          {activeTab === "account" && activeDetail === "main" && (
            <div className="animate-fade-in">
              <div className="detail-header">
                <h4 className="fw-bold mb-0">Hesabın</h4>
                <p className="text-secondary small mb-0 mt-1">
                  Hesap bilgilerini gör veya şifreni değiştir.
                </p>
              </div>
              <div className="settings-list-group">
                <div
                  className="settings-clickable-row"
                  onClick={() => setActiveDetail("username")}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-person fs-5"></i>
                    <div>
                      <div className="fw-bold">Hesap bilgileri</div>
                      <div className="text-secondary small">
                        Kullanıcı adını değiştir.
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right opacity-50"></i>
                </div>
                <div
                  className="settings-clickable-row"
                  onClick={() => setActiveDetail("password")}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-key fs-5"></i>
                    <div>
                      <div className="fw-bold">Şifreni değiştir</div>
                      <div className="text-secondary small">
                        Şifreni güncelle.
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right opacity-50"></i>
                </div>
                <div
                  className="settings-clickable-row"
                  onClick={() => setActiveDetail("delete")}
                >
                  <div className="d-flex align-items-center gap-3 text-danger">
                    <i className="bi bi-heart-break fs-5"></i>
                    <div>
                      <div className="fw-bold">Hesabını devre dışı bırak</div>
                      <div className="text-secondary small text-danger">
                        Hesabını sil.
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right opacity-50 text-danger"></i>
                </div>
              </div>
            </div>
          )}

          {activeDetail === "username" && (
            <div className="animate-fade-in">
              <div className="detail-header back-header">
                <div
                  className="back-icon-wrapper"
                  onClick={() => setActiveDetail("main")}
                >
                  <i className="bi bi-arrow-left fs-5"></i>
                </div>
                <h4 className="fw-bold mb-0">Hesap Bilgileri</h4>
              </div>
              <form onSubmit={handleUsernameSubmit} className="p-4">
                <label className="form-label small fw-bold text-secondary">
                  Kullanıcı Adı
                </label>
                <div className="input-group-custom mb-4">
                  <span className="input-group-addon text-secondary">@</span>
                  <input
                    type="text"
                    className="custom-settings-input"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                {status.type && (
                  <div
                    className={`alert py-2 border-0 ${status.type === "error" ? "alert-danger" : "alert-success"}`}
                  >
                    {status.msg}
                  </div>
                )}
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold w-100 py-2"
                  disabled={loading}
                >
                  Kaydet
                </button>
              </form>
            </div>
          )}

          {activeDetail === "password" && (
            <div className="animate-fade-in">
              <div className="detail-header back-header">
                <div
                  className="back-icon-wrapper"
                  onClick={() => setActiveDetail("main")}
                >
                  <i className="bi bi-arrow-left fs-5"></i>
                </div>
                <h4 className="fw-bold mb-0">Şifreni değiştir</h4>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-4">
                <input
                  type="password"
                  placeholder="Mevcut şifre"
                  className="custom-settings-input-standalone mb-3"
                  value={passData.currentPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="Yeni şifre"
                  className="custom-settings-input-standalone mb-4"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                />
                {status.type && (
                  <div
                    className={`alert py-2 border-0 ${status.type === "error" ? "alert-danger" : "alert-success"}`}
                  >
                    {status.msg}
                  </div>
                )}
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold w-100 py-2"
                  disabled={loading}
                >
                  Şifreyi Güncelle
                </button>
              </form>
            </div>
          )}

          {activeDetail === "delete" && (
            <div className="animate-fade-in">
              <div className="detail-header back-header">
                <div
                  className="back-icon-wrapper"
                  onClick={() => setActiveDetail("main")}
                >
                  <i className="bi bi-arrow-left fs-5"></i>
                </div>
                <h4 className="fw-bold mb-0 text-danger">Hesabını sil</h4>
              </div>
              <div className="p-4">
                <div className="alert alert-danger border-0 rounded-4 p-3 mb-4">
                  <h6 className="fw-bold">Dikkat! Bu işlem geri alınamaz.</h6>
                  <p className="small mb-0 opacity-75">
                    Tüm verileriniz kalıcı olarak kaldırılır.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-outline-danger rounded-pill px-4 fw-bold w-100 py-2"
                >
                  Hesabımı Sil
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="animate-fade-in">
              <div className="detail-header">
                <h4 className="fw-bold mb-0">Görünüm</h4>
                <p className="text-secondary small mb-0 mt-1">
                  Kullandığın arka planı yönet.
                </p>
              </div>
              <div className="p-4 row g-3">
                <div className="col-6">
                  <div
                    onClick={() => handleThemeChange("light")}
                    className={`theme-card-box border ${theme === "light" ? "active" : ""}`}
                  >
                    <i className="bi bi-sun-fill fs-1 text-warning"></i>
                    <div className="mt-2 fw-bold">Açık</div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    onClick={() => handleThemeChange("dark")}
                    className={`theme-card-box border ${theme === "dark" ? "active" : ""}`}
                  >
                    <i className="bi bi-moon-stars-fill fs-1 text-primary"></i>
                    <div className="mt-2 fw-bold">Koyu</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
