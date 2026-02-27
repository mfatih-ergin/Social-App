import { useEffect } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import PostForm from "./PostForm";
import "../../styles/PostModal.css";

export default function PostModal({ isOpen, onClose, onPostCreated }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePostSuccess = () => {
    onClose();
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return ReactDOM.createPortal(
    <div
      className={`comment-modal-overlay ${isDark ? "dark" : ""}`}
      onClick={onClose}
    >
      <div
        className={`comment-modal-content ${isDark ? "bg-black text-white" : "bg-white"} border-0`}
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: "50px" }}
      >
        <div className="modal-header-custom p-3 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Gönderi Oluştur</h5>
          <button
            className={`btn-close ${isDark ? "btn-close-white" : ""}`}
            onClick={onClose}
          ></button>
        </div>

        <div className="modal-body-custom p-0">
          <PostForm onPostCreated={handlePostSuccess} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
