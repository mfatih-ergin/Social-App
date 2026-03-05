import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import FormImagePreview from "../Component/FormImagePreview";
import ImageUploadButton from "../Component/Actions/ImageUploadButton";

export default function EditPostModal({ post, isOpen, onClose, onSubmit }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [imageDeleted, setImageDeleted] = useState(false);

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

  useEffect(() => {
    if (isOpen && post) {
      setText(post.text || "");
      setImagePreview(post.image || null);
      setImage(null);
      setImageDeleted(false);
    }
  }, [isOpen, post]);

  const handleImageSelect = (file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageDeleted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ text, image, imageDeleted });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`modal-content border-0 shadow-lg ${isDark ? "bg-dark text-white" : "bg-white"}`}
        >
          <div
            className={`modal-header border-bottom ${isDark ? "border-secondary" : ""}`}
          >
            <h5 className="modal-title fw-bold">Gönderiyi Düzenle</h5>
            <button
              type="button"
              className={`btn-close ${isDark ? "btn-close-white" : ""}`}
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <textarea
                className={`form-control border-0 shadow-none fs-5 p-0 ${isDark ? "bg-dark text-white" : "bg-white text-dark"}`}
                rows="4"
                placeholder="Neler oluyor?"
                style={{ resize: "none" }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />

              <div className="mt-3">
                <FormImagePreview
                  preview={imagePreview}
                  onRemove={removeImage}
                />
              </div>
            </div>

            <div
              className={`modal-footer border-top d-flex justify-content-between ${isDark ? "border-secondary" : ""}`}
            >
              <div className="d-flex align-items-center">
                <ImageUploadButton onImageSelect={handleImageSelect} />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none fw-bold text-secondary"
                  onClick={onClose}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!text.trim() && !imagePreview)}
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                >
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Güncelle"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
