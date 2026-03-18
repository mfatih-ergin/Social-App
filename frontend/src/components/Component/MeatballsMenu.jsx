import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import "./MeatballsMenu.css";

export default function MeatballsMenu({
  isOwner,
  onDelete,
  onEdit,
  targetUser,
  onFollowToggle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === "dark";

  const [localIsFollowing, setLocalIsFollowing] = useState(
    targetUser?.isFollowing,
  );

  useEffect(() => {
    setLocalIsFollowing(targetUser?.isFollowing);
  }, [targetUser?.isFollowing]);

  useEffect(() => {
    const handleGlobalFollow = (event) => {
      if (event.detail.userId === targetUser?._id) {
        setLocalIsFollowing(event.detail.isFollowing);
      }
    };
    window.addEventListener("userFollowed", handleGlobalFollow);
    return () => window.removeEventListener("userFollowed", handleGlobalFollow);
  }, [targetUser?._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setIsOpen(false);
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
        className={`dropdown-menu dropdown-menu-end shadow border-0 p-0 m-0 overflow-hidden ${isDark ? "dropdown-dark" : ""} ${isOpen ? "show" : ""}`}
        style={{
          minWidth: "220px",
          display: isOpen ? "block" : "none",
          position: "absolute",
          right: 0,
          zIndex: 1000,
        }}
      >
        {isOwner ? (
          <>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center py-2 px-3 ${isDark ? "text-white" : "text-dark"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
              >
                <i className="bi bi-pencil me-3"></i>Düzenle
              </button>
            </li>
            <li>
              <button
                className="dropdown-item text-danger d-flex align-items-center py-2 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setIsOpen(false);
                }}
              >
                <i className="bi bi-trash me-3"></i>Sil
              </button>
            </li>
          </>
        ) : (
          <li>
            <button
              className={`dropdown-item d-flex align-items-center py-2 px-3 ${localIsFollowing ? "text-danger" : isDark ? "text-white" : "text-dark"}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  navigate("/login", { state: { from: location } });
                  return;
                }

                const newStatus = !localIsFollowing;
                onFollowToggle(targetUser?._id, localIsFollowing);

                window.dispatchEvent(
                  new CustomEvent("userFollowed", {
                    detail: { userId: targetUser?._id, isFollowing: newStatus },
                  }),
                );

                setLocalIsFollowing(newStatus);
                setIsOpen(false);
              }}
            >
              <i
                className={`bi ${localIsFollowing ? "bi-person-x" : "bi-person-plus"} me-3`}
              ></i>
              <span>
                {localIsFollowing
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
