import { useState } from "react";
import { updateUserSettings, deleteUserAccount } from "../api/user.api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const navigate = useNavigate();

  const changeTheme = async (newTheme) => {
    if (loading || theme === newTheme) return;
    try {
      setLoading(true);
      const res = await updateUserSettings(newTheme);
      toggleTheme(newTheme);
      setUser((prevUser) => ({ ...prevUser, settings: res.data }));
    } catch (error) {
      console.error("Tema güncellenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kaybolur.",
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        await deleteUserAccount(user?._id || user?.id);

        alert("Hesabınız başarıyla silindi.");

        navigate("/", { replace: true });
        logout();
      } catch (error) {
        console.error("Hesap silinirken hata oluştu:", error);
        alert(
          error.response?.data?.message || "Hesap silinirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-vh-100 ${theme === "dark" ? "bg-black text-white" : "bg-light text-dark"}`}
      style={{ transition: "0.3s" }}
    >
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4 col-lg-4">
            <div
              className={`card border-0 shadow-sm rounded-4 sticky-top ${
                theme === "dark" ? "bg-dark text-white" : "bg-white"
              }`}
              style={{ top: "2rem" }}
            >
              <div className="p-3">
                <h4 className="fw-bold px-3 mb-3">Ayarlar</h4>
                <div className="list-group list-group-flush rounded-3 overflow-hidden">
                  <button
                    onClick={() => setActiveTab("appearance")}
                    className={`list-group-item list-group-item-action border-0 p-3 d-flex align-items-center gap-3 sidebar-link ${
                      activeTab === "appearance"
                        ? "active bg-primary shadow-sm"
                        : theme === "dark"
                          ? "bg-dark text-white"
                          : ""
                    }`}
                  >
                    <i className="bi bi-palette-fill fs-5"></i>
                    <span className="fs-6">Görünüm</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`list-group-item list-group-item-action border-0 p-3 d-flex align-items-center gap-3 sidebar-link ${
                      activeTab === "account"
                        ? "active bg-primary shadow-sm"
                        : theme === "dark"
                          ? "bg-dark text-white"
                          : ""
                    }`}
                  >
                    <i className="bi bi-person-gear fs-5"></i>
                    <span className="fs-6">Hesap Ayarları</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8 col-lg-8">
            <div
              className={`card border-0 shadow-sm rounded-4 p-4 p-md-5 ${
                theme === "dark" ? "bg-dark text-white" : "bg-white"
              }`}
            >
              {activeTab === "appearance" && (
                <div className="animate-fade-in">
                  <h3 className="fw-bold mb-1">Görünüm</h3>
                  <p className="text-secondary mb-4">
                    Uygulama temasını kişiselleştir. Bu ayar tüm cihazlarında
                    senkronize edilir.
                  </p>

                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div
                        onClick={() => changeTheme("light")}
                        className={`theme-card p-4 rounded-4 text-center border ${
                          theme === "light"
                            ? "border-primary border-2 shadow-sm"
                            : "border-secondary-subtle"
                        } ${loading ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <i
                          className={`bi bi-sun-fill display-4 ${theme === "light" ? "text-warning" : "text-secondary"}`}
                        ></i>
                        <h6 className="mt-3 fw-bold mb-0">Açık Tema</h6>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div
                        onClick={() => changeTheme("dark")}
                        className={`theme-card p-4 rounded-4 text-center border ${
                          theme === "dark"
                            ? "border-primary border-2 shadow-sm"
                            : "border-secondary-subtle"
                        } ${loading ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <i
                          className={`bi bi-moon-stars-fill display-4 ${theme === "dark" ? "text-primary" : "text-secondary"}`}
                        ></i>
                        <h6 className="mt-3 fw-bold mb-0">Koyu Tema</h6>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="animate-fade-in">
                  <h3 className="fw-bold mb-1">Hesap Ayarları</h3>
                  <p className="text-secondary mb-4">
                    Profil bilgilerini ve güvenlik seçeneklerini yönet.
                  </p>

                  <div className="mt-5 p-4 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                    <h5 className="text-danger fw-bold">Tehlikeli Bölge</h5>
                    <p className="text-secondary mb-3">
                      Hesabınızı sildiğinizde tüm verileriniz (mesajlar, ayarlar
                      ve profil) kalıcı olarak kaldırılır. Bu işlem geri
                      alınamaz.
                    </p>
                    <button
                      className="btn btn-danger px-4 py-2 rounded-pill fw-bold"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      {loading ? (
                        <i className="bi bi-arrow-repeat spin me-2"></i>
                      ) : (
                        <i className="bi bi-trash3 me-2"></i>
                      )}
                      Hesabı Sil
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-secondary small">
              {loading && (
                <span className="bg-dark bg-opacity-10 px-3 py-2 rounded-pill">
                  <i className="bi bi-arrow-repeat spin me-2"></i> İşlem
                  yapılıyor...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
