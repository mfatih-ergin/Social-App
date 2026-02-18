import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../Component/Avatar";
import FormImagePreview from "../Component/FormImagePreview";
import ImageUploadButton from "../Component/Actions/ImageUploadButton";
import RepostCard from "../Post/RepostCard";
import "../../styles/QuoteModal.css";

export default function QuoteModal({ post, isOpen, onClose, onSubmit }) {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen || !post) return null;

  const handleImageSelect = (file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    // Alıntı metni veya resim varsa gönderilebilir
    onSubmit({ text, image });
    setText("");
    removeImage();
    onClose();
  };

  return (
    <div
      className={`quote-modal-overlay ${isDark ? "dark" : ""}`}
      onClick={onClose}
    >
      <div
        className={`quote-modal-content ${isDark ? "bg-black text-white border-secondary" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex align-items-center">
          <button
            className={`btn-close ${isDark ? "btn-close-white" : ""}`}
            onClick={onClose}
          ></button>
          <span className="fw-bold ms-4 fs-5">Alıntıla</span>
        </div>

        <div className="p-3">
          <div className="d-flex gap-3">
            <Avatar
              userId={currentUser?._id || currentUser?.id}
              profileImage={currentUser?.profileImage}
              size="48px"
            />
            <div className="w-100">
              <textarea
                className={`form-control border-0 shadow-none bg-transparent fs-5 p-0 mb-2 ${isDark ? "text-white" : ""}`}
                placeholder="Neler oluyor?"
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                style={{ resize: "none" }}
              ></textarea>

              {/* Orijinal Postun Önizlemesi */}
              <div className="quote-original-preview mt-2 border rounded-3 overflow-hidden">
                <RepostCard post={post} />
              </div>

              {/* Seçilen Resim Önizlemesi */}
              {imagePreview && (
                <div className="mt-3">
                  <FormImagePreview
                    preview={imagePreview}
                    onRemove={removeImage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-top border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
          <ImageUploadButton onImageSelect={handleImageSelect} />
          <button
            className="btn btn-primary rounded-pill fw-bold px-4"
            disabled={!text.trim() && !image}
            onClick={handleSubmit}
          >
            Alıntıla
          </button>
        </div>
      </div>
    </div>
  );
}
