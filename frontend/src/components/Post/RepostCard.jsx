import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import Avatar from "../Component/Avatar";
import "../../styles/RepostCard.css";

export default function RepostCard({ post, isComment = false }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  if (!post) return null;

  const source = post._doc || post;

  const userData = source.user || source.userId;
  const contentText = source.text;
  const contentImage = source.image;
  const createdAt = source.createdAt;
  const id = source._id || source.id;

  const handleCardClick = (e) => {
    e.stopPropagation();
    const targetPath = isComment ? `/comment/detail/${id}` : `/post/${id}`;
    navigate(targetPath);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`repost-card-mini border rounded-3 mt-2 p-2 ${
        isDark
          ? "border-secondary border-opacity-50 hover-dark"
          : "border-light-subtle hover-light"
      }`}
    >
      <div className="d-flex align-items-center gap-2 mb-1">
        <Avatar
          userId={userData?._id || userData?.id}
          profileImage={userData?.profileImage}
          size="20px"
        />
        <span
          className="fw-bold small text-truncate"
          style={{ maxWidth: "150px" }}
        >
          {userData?.username || "Kullanıcı"}
        </span>
        <span className="text-secondary small">·</span>
        <span className="text-secondary small">
          {formatRelativeTime(createdAt)}
        </span>
      </div>

      <div className="repost-mini-body">
        {contentText ? (
          <p
            className="small mb-1 text-truncate-custom"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {contentText}
          </p>
        ) : (
          <p className="small mb-1 text-muted opacity-50 italic">
            İçerik yüklenemedi
          </p>
        )}

        {contentImage && (
          <div className="repost-mini-image mt-2">
            <img
              src={
                contentImage.startsWith("http")
                  ? contentImage
                  : `http://localhost:5000${contentImage}`
              }
              alt="repost content"
              className="img-fluid rounded-2 border border-secondary border-opacity-10"
              style={{ maxHeight: "150px", width: "100%", objectFit: "cover" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
