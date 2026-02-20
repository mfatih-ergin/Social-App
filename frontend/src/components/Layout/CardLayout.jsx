import React from "react";
import "../../styles/CardLayout.css";

/**
 * Kart iskeleti (Layout)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Kart içeriği
 * @param {Function} props.onClick - Karta tıklandığında çalışacak fonksiyon
 * @param {string} props.theme - "light" veya "dark"
 * @param {boolean} props.isDeleting - Silme işlemi sırasında kartı pasifleştirir
 * @param {boolean} props.clickable - Kartın hover efekti ve cursor stilini belirler
 */
export default function CardLayout({
  children,
  onClick,
  theme,
  isDeleting,
  clickable = true,
  isReply = false, // Yeni prop!
}) {
  const isDark = theme === "dark";

  return (
    <article
      onClick={onClick}
      className={`card-layout 
        ${isDark ? "dark" : ""} 
        ${isDeleting ? "card-layout-deleting" : ""} 
        ${clickable ? "card-layout-clickable" : ""}
        ${isReply ? "reply-style" : ""}`} // Yanıtsa özel stil ekle
    >
      <div className="card-layout-body">{children}</div>
    </article>
  );
}
