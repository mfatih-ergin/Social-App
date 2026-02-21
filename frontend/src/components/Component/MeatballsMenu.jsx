import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/MeatballsMenu.css";

export default function MeatballsMenu({
  isOwner,
  onDelete,
  targetUser,
  onFollowToggle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button
        className={`btn border-0 meatball-btn ${isDark ? "text-white" : "text-secondary"}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <i className="bi bi-three-dots"></i>
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end shadow border-0 p-0 m-0 overflow-hidden ${
          isDark ? "dropdown-dark" : ""
        } ${isOpen ? "show" : ""}`}
        style={{
          minWidth: "220px",
          display: isOpen ? "block" : "none",
          position: "absolute",
          right: 0,
          zIndex: 1100,
        }}
      >
        {isOwner ? (
          <li>
            <button
              className="dropdown-item text-danger d-flex align-items-center py-2 px-3"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsOpen(false);
              }}
            >
              <i className="bi bi-trash me-3"></i>
              Sil
            </button>
          </li>
        ) : (
          <li>
            <button
              className={`dropdown-item d-flex align-items-center py-2 px-3 ${
                targetUser?.isFollowing
                  ? "text-danger"
                  : isDark
                    ? "text-white"
                    : "text-dark"
              }`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  alert("Bu işlem için giriş yapmalısınız!");
                  return;
                }
                onFollowToggle(targetUser?._id, targetUser?.isFollowing);
                setIsOpen(false);
              }}
            >
              <i
                className={`bi ${
                  targetUser?.isFollowing ? "bi-person-x" : "bi-person-plus"
                } me-3`}
              ></i>
              <span>
                {targetUser?.isFollowing
                  ? `@${targetUser?.username} Takipten Çık`
                  : `@${targetUser?.username} Takip Et`}
              </span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
