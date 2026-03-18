import { useTheme } from "../../../../hooks/useTheme";
import "./CommentButton.css";

export default function CommentButton({ commentsCount, onClick }) {
  const { theme } = useTheme();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={`btn d-flex align-items-center gap-1 border-0 bg-transparent p-0 comment-btn 
        ${theme === "dark" ? "dark-theme" : ""}`}
    >
      <div className="comment-icon-wrapper">
        <i className="bi bi-chat comment-icon"></i>
      </div>
      <span className=" fw-bold user-select-none comment-count">
        {commentsCount || 0}
      </span>
    </button>
  );
}
