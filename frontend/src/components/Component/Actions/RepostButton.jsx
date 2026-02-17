import { useTheme } from "../../../context/ThemeContext";
import "../../../styles/RepostButton.css";

export default function RepostButton({
  repostsCount,
  isReposted,
  onRepost,
  onQuote,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="dropdown repost-dropdown">
      <button
        className={`btn d-flex align-items-center gap-2 border-0 bg-transparent p-0 repost-btn 
          ${isDark ? "dark-theme" : ""} ${isReposted ? "reposted" : ""}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon-wrapper">
          <i className={`bi bi-repeat fs-4`}></i>
        </div>
        <span className="fw-bold user-select-none repost-count">
          {repostsCount || 0}
        </span>
      </button>

      <ul
        className={`dropdown-menu shadow ${isDark ? "dropdown-menu-dark" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <li>
          <button
            className="dropdown-item d-flex align-items-center gap-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onRepost();
            }}
          >
            <i className="bi bi-repeat"></i>
            <span>Repost</span>
          </button>
        </li>
        <li>
          <button
            className="dropdown-item d-flex align-items-center gap-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onQuote();
            }}
          >
            <i className="bi bi-pencil-square"></i>
            <span>Alıntıla</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
