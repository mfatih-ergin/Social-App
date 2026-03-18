import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { formatRelativeTime } from "../../Component/DateInfo";
import Avatar from "../../Component/Avatar";
import CardLayout from "../../Layout/CardLayout/CardLayout";
import "./RepostCard.css";

export default function RepostCard({ post, isComment = false }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  if (!post) {
    return (
      <div className="repost-container-wrapper mt-2">
        <div
          className={`mini-quote-card-deleted ${theme === "dark" ? "dark" : ""}`}
        >
          <div className="d-flex align-items-center gap-2 p-3">
            <i className="bi bi-exclamation-circle fs-5"></i>
            <span className="fw-medium">Bu içerik artık mevcut değil.</span>
          </div>
        </div>
      </div>
    );
  }

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
    const targetPath = isComment ? `/comment/${id}` : `/post/${id}`;
    navigate(targetPath);
  };

  return (
    <div>
      <CardLayout
        theme={theme}
        clickable={true}
        onClick={handleCardClick}
        className="mini-quote-card"
        isQuote={true}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <Avatar
            userId={userId}
            profileImage={profileImage}
            size="30px"
            userData={{
              ...source,
              username,
              profileImage,
            }}
          />
          <span
            className="fw-bold small text-truncate"
            style={{ maxWidth: "150px", fontSize: "0.85rem" }}
          >
            {username}
          </span>
          <span className="text-secondary small">·</span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {createdAt ? formatRelativeTime(createdAt) : ""}
          </span>
        </div>

        <div className="repost-content">
          {contentText.trim() && (
            <p
              className="content-text mb-2"
              style={{ fontSize: "0.9rem", lineHeight: "1.4" }}
            >
              {contentText}
            </p>
          )}

          {contentImage && (
            <div className="post-media-wrapper" style={{ marginTop: "5px" }}>
              <img
                src={
                  contentImage.startsWith("http")
                    ? contentImage
                    : `http://localhost:5000${contentImage}`
                }
                alt="repost content"
                className="post-image"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}

          {!contentText.trim() && !contentImage && (
            <p
              className={`small mb-0 fst-italic ${
                theme === "dark" ? "text-white-50" : "text-muted opacity-50"
              }`}
            >
              İçerik boş.
            </p>
          )}
        </div>
      </CardLayout>
    </div>
  );
}
