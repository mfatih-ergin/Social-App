import { Link } from "react-router-dom";
import Avatar from "../../Component/Avatar";
import "./SidebarProfile.css";

export default function SidebarProfile({ user, isDark }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="d-flex align-items-center justify-content-between profile-section">
      <div className="d-flex align-items-center flex-grow-1 text-truncate">
        <Avatar
          userId={user?._id}
          profileImage={user?.profileImage}
          size="36px"
        />

        <div className="ms-2 text-truncate text-start">
          <Link
            to={user ? `/profile/${user._id}` : "/login"}
            className="text-decoration-none text-reset d-block"
          >
            <div
              className="fw-bold text-truncate"
              style={{ fontSize: "0.95rem" }}
            >
              {user ? user.username : "Misafir"}
            </div>
          </Link>
        </div>
      </div>

      <div className="dropdown">
        <button
          className="btn border-0 p-1 dropdown-toggle shadow-none"
          type="button"
          id="dropdownUser1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{
            color: "inherit",
            backgroundColor: "transparent",
            outline: "none",
          }}
        />
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
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
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
  );
}
