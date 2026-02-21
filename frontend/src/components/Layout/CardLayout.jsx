import React from "react";
import "../../styles/CardLayout.css";

export default function CardLayout({
  children,
  onClick,
  theme,
  isDeleting,
  clickable = true,
  isReply = false,
  className = "",
}) {
  const isDark = theme === "dark";

  return (
    <article
      onClick={onClick}
      className={`card-layout 
        ${isDark ? "dark" : ""} 
        ${isDeleting ? "card-layout-deleting" : ""} 
        ${clickable ? "card-layout-clickable" : ""}
        ${isReply ? "reply-style" : ""}
        ${className}`}
    >
      <div className="card-layout-body">{children}</div>
    </article>
  );
}
