import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../Component/Avatar";
import PostModal from "../Post/PostModal";
import "../../styles/Navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div
      className={`sidebar-container ${isDark ? "dark-theme" : "light-theme"}`}
    >
      <Link
        to="/"
        className="navbar-brand text-decoration-none fs-4 px-2 mb-2 fw-bold"
      >
        Social App
      </Link>

      <hr />

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
          >
            <span className="icon-box">
              <i className="bi bi-house-fill"></i>
            </span>
            <span>Ana Sayfa</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
          >
            <span className="icon-box">
              <i className="bi bi-search"></i>
            </span>
            <span>Keşfet</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              `nav-link-custom ${isActive ? "active" : ""}`
            }
          >
            <span className="icon-box">
              <i className="bi bi-bookmark"></i>
            </span>
            <span>Yer İşaretleri</span>
          </NavLink>
        </li>

        {user && (
          <li>
            <button
              className="btn-post-custom shadow"
              onClick={() => setIsPostModalOpen(true)}
            >
              Gönderi Paylaş
            </button>
          </li>
        )}
      </ul>

      <hr />

      <div className="d-flex align-items-center justify-content-between profile-section">
        <div className="d-flex align-items-center me-2 user-link-container">
          <Avatar
            userId={user?._id}
            profileImage={user?.profileImage}
            size="32px"
          />

          <Link
            to={user ? `/profile/${user._id}` : "/login"}
            className="text-decoration-none"
            style={{ color: "inherit" }}
          >
            <strong
              className="ms-2 text-truncate d-block"
              style={{ maxWidth: "120px" }}
            >
              {user?.username || "Misafir"}
            </strong>
          </Link>
        </div>

        <div className="dropdown">
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none dropdown-toggle p-1"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
          ></a>
          <ul
            className={`dropdown-menu shadow ${isDark ? "dropdown-menu-dark" : ""}`}
            aria-labelledby="dropdownUser1"
          >
            {user ? (
              <>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="bi bi-gear me-2"></i>Ayarlar
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/login">
                    <i className="bi bi-arrow-repeat me-2"></i>Hesap Değiştir
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                  >
                    <i className="bi bi-box-arrow-left me-2"></i>Çıkış Yap
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="dropdown-item" to="/login">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Giriş Yap
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/register">
                    <i className="bi bi-person-plus me-2"></i>Kayıt Ol
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
