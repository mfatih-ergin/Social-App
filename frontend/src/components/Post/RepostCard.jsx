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

  const userData = source?.user || {};
  const username = userData?.username || source?.username || "Kullanıcı";
  const profileImage = userData?.profileImage || source?.profileImage;
  const userId = userData?._id || userData?.id || source?.userId;

  const contentText = source?.text || "";
  const contentImage = source?.image || "";
  const createdAt = source?.createdAt;
  const id = source?._id || source?.id;

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!id) return;

    const targetPath = isComment ? `/comment/detail/${id}` : `/post/${id}`;
    navigate(targetPath);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`repost-ghost-view ${isDark ? "text-white" : "text-dark"}`}
      style={{ position: "relative", zIndex: 10 }}
    >
      <div className="d-flex align-items-center gap-2 mb-2">
        <Avatar userId={userId} profileImage={profileImage} size="22px" />
        <span
          className="fw-bold small text-truncate"
          style={{ maxWidth: "180px" }}
        >
          {username}
        </span>
        <span className="text-secondary small">·</span>
        <span className="text-secondary" style={{ fontSize: "0.8rem" }}>
          {createdAt ? formatRelativeTime(createdAt) : ""}
        </span>
      </div>

      <div className="repost-body-clean">
        {contentText.trim() && (
          <p className="repost-text-clean mb-2">{contentText}</p>
        )}

        {contentImage && (
          <div className="repost-mini-image mb-0 overflow-hidden rounded-3">
            <img
              src={
                contentImage.startsWith("http")
                  ? contentImage
                  : `http://localhost:5000${contentImage}`
              }
              alt="repost content"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "350px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}

        {!contentText.trim() && !contentImage && (
          <p className="small mb-0 text-muted opacity-50 fst-italic">
            İçerik yüklenemedi.
          </p>
        )}
      </div>
    </div>
  );
}
