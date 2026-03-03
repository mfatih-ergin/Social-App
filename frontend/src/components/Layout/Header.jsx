import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes("/home")) return { title: "Ana Sayfa", showBack: false };
    if (path.includes("/explore")) return { title: "Keşfet", showBack: false };
    if (path.includes("/post") || path.includes("/comment"))
      return { title: "Gönderi", showBack: true };
    if (path.includes("/bookmarks"))
      return { title: "Yer İşaretleri", showBack: true };
    if (
      path.includes("/profile") &&
      (path.includes("/followers") || path.includes("/following"))
    ) {
      return {
        title: path.includes("/following") ? "Takip Edilenler" : "Takipçiler",
        showBack: true,
      };
    }
    return { title: "Detaylar", showBack: true };
  };

  const { title, showBack } = getHeaderInfo();

  return (
    <div
      className={`d-flex align-items-center px-3 sticky-top ${
        isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        zIndex: 1050,
        height: "75px",
        borderBottom: isDark ? "1px solid #2f3336" : "1px solid #eff3f4",
      }}
    >
      {showBack && (
        <button
          className={`btn border-0 p-0 me-3 ${isDark ? "text-white" : "text-dark"}`}
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left fs-5"></i>
        </button>
      )}
      <h5 className="mb-0 fw-bold fs-5">{title}</h5>
    </div>
  );
}
