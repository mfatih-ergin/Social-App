import { useState } from "react";
import { createPost } from "../../api/post.api";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

import FormImagePreview from "../Component/FormImagePreview";
import Avatar from "../Component/Avatar";
import ImageUploadButton from "../Component/Actions/ImageUploadButton";

import "../../styles/PostForm.css";

export default function PostForm({ onPostCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();

  const handleImageSelect = (file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      await createPost(formData);
      setText("");
      removeImage();
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Post hatası:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`card border-0 border-bottom rounded-0 px-3 py-3 post-form-card ${theme === "dark" ? "dark" : ""}`}
    >
      <div className="d-flex">
        <div className="me-3">
          <Avatar userId={user?._id} profileImage={user?.profileImage} />
        </div>

        <div className="w-100 mt-1">
          <div className="mb-1">
            <Link
              to={`/profile/${user?._id || user?.id}`}
              className="text-decoration-none fw-bold username-link"
              style={{ fontSize: "0.95rem" }}
            >
              {user?.username || "Kullanıcı"}
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className={`form-control border-0 shadow-none fs-5 p-0 mt-1 post-textarea ${theme === "dark" ? "text-white" : "text-dark"}`}
              rows="2"
              placeholder="Gönderi paylaş"
              style={{
                resize: "none",
                backgroundColor: "transparent",
                minHeight: "60px",
              }}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <FormImagePreview preview={imagePreview} onRemove={removeImage} />

            <div
              className={`d-flex justify-content-between align-items-center mt-3 pt-3 border-top ${theme === "dark" ? "border-secondary" : ""}`}
            >
              <div className="d-flex align-items-center">
                <ImageUploadButton onImageSelect={handleImageSelect} />
              </div>

              <button
                type="submit"
                disabled={(!text.trim() && !image) || isSubmitting}
                className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm"
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Gönderi Paylaş"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
