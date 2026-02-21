import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function CollectionButton({
  label,
  isActive,
  onClick,
  isSpecial = false,
  icon = null,
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
    <button
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
  );
}
