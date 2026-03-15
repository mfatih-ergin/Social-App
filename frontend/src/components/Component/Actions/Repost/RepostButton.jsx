import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import "./RepostButton.css";

export default function RepostButton({
  repostsCount,
  isReposted,
  onRepost,
  onQuote,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`dropup repost-dropdown`} ref={dropdownRef}>
      <button
        className={`btn d-flex align-items-center gap-1 border-0 bg-transparent p-0 repost-btn 
          ${isDark ? "dark-theme" : ""} ${isReposted ? "reposted" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <div className="icon-wrapper">
          <i className={`bi bi-repeat fs-4`}></i>
        </div>
        <span className="fw-bold user-select-none repost-count">
          {repostsCount || 0}
        </span>
      </button>

      <ul
        className={`dropdown-menu shadow ${isDark ? "dropdown-menu-dark" : ""} ${isOpen ? "show" : ""}`}
        style={{
          display: isOpen ? "block" : "none",
          position: "absolute",
          bottom: "100%",
          left: "0",
          marginBottom: "10px",
          zIndex: 1000,
          transform: "none",
        }}
      >
        <li>
          <button
            className={`dropdown-item d-flex align-items-center gap-2 py-2 ${isReposted ? "text-danger" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onRepost();
              setIsOpen(false);
            }}
          >
            <i className="bi bi-repeat"></i>
            <span>{isReposted ? "Gönderimi geri al" : "Repost"}</span>
          </button>
        </li>
        <li>
          <button
            className="dropdown-item d-flex align-items-center gap-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onQuote();
              setIsOpen(false);
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
