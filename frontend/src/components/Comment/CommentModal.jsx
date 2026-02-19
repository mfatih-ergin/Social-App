import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../Component/DateInfo";
import Avatar from "../Component/Avatar";
import FormImagePreview from "../Component/FormImagePreview";
import ImageUploadButton from "../Component/Actions/ImageUploadButton";
import "../../styles/CommentModal.css";

export default function CommentModal({ post, isOpen, onClose, onSubmit }) {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";

  const [commentText, setCommentText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen || !post) return null;

  const postUsername = post.username || post.user?.username || "Kullanıcı";
  const postUserId = post.userId || post.user?._id || post.user?.id;
  const postProfileImage = post.profileImage || post.user?.profileImage;

  const handleImageSelect = (file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!commentText.trim() && !image) return;
    onSubmit({ text: commentText, image: image });
    setCommentText("");
    removeImage();
    onClose();
  };

  return (
    <div
      className={`comment-modal-overlay ${isDark ? "dark" : ""}`}
      onClick={onClose}
    >
      <div
        className={`comment-modal-content ${isDark ? "bg-black text-white" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom p-3">
          <button
            className={`btn-close ${isDark ? "btn-close-white" : ""}`}
            onClick={onClose}
          ></button>
        </div>

        <div className="modal-body-custom px-3 pb-3">
          <div className="parent-post-section d-flex gap-3">
            <div className="d-flex flex-column align-items-center">
              <Avatar
                userId={postUserId}
                profileImage={postProfileImage}
                size="48px"
              />
              <div className="reply-line"></div>
            </div>
            <div className="post-details w-100">
              <div className="d-flex gap-2 align-items-center">
                <Link
                  to={`/profile/${postUserId}`}
                  className="text-decoration-none text-reset fw-bold hover-underline"
                >
                  {postUsername}
                </Link>
                <span className="text-secondary small">·</span>
                <span className="text-secondary small">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>

              {post.text && <p className="mt-1 mb-2">{post.text}</p>}

              {post.image && (
                <div className="modal-post-image-container mb-2">
                  <img
                    src={
                      post.image.startsWith("http")
                        ? post.image
                        : `http://localhost:5000${post.image}`
                    }
                    alt="post"
                    className="img-fluid rounded-3 border border-secondary border-opacity-25"
                  />
                </div>
              )}

              <div className="small text-secondary mb-3">
                Yanıt verilen kişi:{" "}
                <span className="text-primary">@{postUsername}</span>
              </div>
            </div>
          </div>

          <div className="my-reply-section d-flex gap-3">
            <div className="d-flex flex-column align-items-center">
              <Avatar
                userId={currentUser?._id || currentUser?.id}
                profileImage={currentUser?.profileImage}
                size="48px"
              />
            </div>
            <div className="w-100">
              <textarea
                className={`form-control border-0 shadow-none bg-transparent fs-5 p-0 pt-1 ${isDark ? "text-white" : ""}`}
                placeholder="Yanıtını gönder"
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoFocus
                style={{ resize: "none" }}
              ></textarea>

              <div className="mt-2">
                <FormImagePreview
                  preview={imagePreview}
                  onRemove={removeImage}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary border-opacity-10">
                <div className="d-flex align-items-center">
                  <ImageUploadButton onImageSelect={handleImageSelect} />
                </div>

                <button
                  className="btn btn-primary rounded-pill fw-bold px-4"
                  disabled={!commentText.trim() && !image}
                  onClick={handleSubmit}
                >
                  Yanıtla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
