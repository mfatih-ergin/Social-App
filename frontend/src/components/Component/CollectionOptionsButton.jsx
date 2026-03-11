import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/CreateCollectionButton.css";

export default function CollectionOptionsButton({ onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="dropdown">
      <button
        type="button"
        className={`create-coll-icon-btn ${isDark ? "dark" : "light"}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-three-dots fs-5"></i>
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end shadow py-0 overflow-hidden ${
          isDark ? "dropdown-menu-dark border-secondary" : ""
        }`}
        style={{ minWidth: "160px" }}
      >
        <li>
          <button
            className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
            onClick={onDelete}
          >
            <i className="bi bi-trash"></i>
            <span className="fw-medium">Koleksiyonu Sil</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
