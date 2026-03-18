import React from "react";
import { useTheme } from "../../hooks/useTheme";

export default function CollectionButton({
  label,
  isActive,
  onClick,
  isSpecial = false,
  icon = null,
  onDelete = null,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hoverClass = isDark ? "hover-dark" : "hover-light";

  const getStyleClass = () => {
    if (isSpecial) {
      return `btn-outline-primary text-primary ${hoverClass}`;
    }

    if (isActive) {
      return isDark
        ? "bg-white text-black border-white"
        : "bg-dark text-white border-dark";
    }

    return isDark
      ? `text-white border-secondary border-opacity-50 ${hoverClass}`
      : `text-dark border-secondary border-opacity-50 ${hoverClass}`;
  };

  return (
    <div className="position-relative d-inline-flex align-items-center">
      <button
        type="button"
        onClick={onClick}
        className={`btn rounded-pill px-3 py-1 fw-500 transition-all border d-flex align-items-center gap-2 ${getStyleClass()}`}
        style={{
          fontSize: "0.85rem",
          transition: "all 0.2s ease-in-out",
          whiteSpace: "nowrap",
        }}
      >
        {icon && <i className={`bi ${icon}`}></i>}
        <span>{label}</span>
      </button>

      {onDelete && !isSpecial && label !== "Tümü" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
          style={{
            marginLeft: "-12px",
            marginTop: "-15px",
            zIndex: 2,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: isDark ? "#ff4444" : "#dc3545",
            color: "white",
            fontSize: "10px",
          }}
        >
          <i className="bi bi-x"></i>
        </button>
      )}
    </div>
  );
}
