import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost, repostContent } from "../../api/post.api";
import { addComment } from "../../api/comment.api";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../context/AuthContext";

import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import PostActions from "../Component/Actions/PostActions";
import CommentModal from "../Comment/CommentModal";
import QuoteModal from "../Component/QuoteModal";
import RepostCard from "./RepostCard";

import "../../styles/PostCard.css";

export default function PostCard({ post, onUpdate, isDetailView = false }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  if (!post) return null;

  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;
    navigate(`/post/${post._id}`);
  };

  const handleDelete = async (e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bu postu silmek istediğine emin misin?")) return;

    try {
      setIsDeleting(true);
      await deletePost(post._id);
      onUpdate?.(isDetailView);
    } catch (error) {
      alert("Post silinemedi");
      setIsDeleting(false);
    }
  };

  const handleCommentClick = (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setIsCommentModalOpen(true);
  };

  const handleDirectRepost = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await repostContent(post._id);
      onUpdate?.();
    } catch (error) {
      console.error("Repost hatası:", error);
    }
  };

  const handleQuoteClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsQuoteModalOpen(true);
  };

  const handleCommentSubmit = async (commentData) => {
    const { text, image } = commentData;
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      await addComment(post._id, formData);
      setIsCommentModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Yorum gönderilirken hata oluştu:", error);
    }
  };

  const handleQuoteSubmit = async (quoteData) => {
    const { text, image } = quoteData;
    const formData = new FormData();

    formData.append("text", text || "");
    formData.append("type", "post");

    if (image) {
      formData.append("image", image);
    }

    try {
      await repostContent(post._id, formData);
      setIsQuoteModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Alıntı gönderilirken hata oluştu:", error);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`post-card mx-auto w-100 ${theme === "dark" ? "dark" : ""} ${
          isDeleting ? "opacity-50" : ""
        } ${!isDetailView ? "clickable-card" : ""}`}
        style={{ cursor: !isDetailView ? "pointer" : "default" }}
      >
        <div className="card-body">
          {post.isRepost && !post.text && (
            <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center">
              <i className="bi bi-repeat me-2"></i>
              <span>
                {post.user?._id === user?._id ? "Sen" : post.user?.username}{" "}
                Repost
              </span>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-2">
            <UserInfo
              userId={post.userId || post.user?._id}
              username={post.username || post.user?.username}
              profileImage={post.profileImage || post.user?.profileImage}
              createdAt={post.createdAt}
              formatTime={formatRelativeTime}
            />
            <div onClick={(e) => e.stopPropagation()}>
              <MeatballsMenu isOwner={post.isOwner} onDelete={handleDelete} />
            </div>
          </div>

          <div className="post-container">
            {(post.text || post.image) && (
              <PostContent text={post.text} image={post.image} />
            )}

            {post.isRepost && (
              <div className="mt-2 quote-wrapper">
                {post.parentPost ? (
                  <RepostCard post={post.parentPost} isComment={false} />
                ) : post.parentComment ? (
                  <RepostCard post={post.parentComment} isComment={true} />
                ) : (
                  <div className="p-3 border rounded text-secondary small italic">
                    Orijinal içerik silinmiş.
                  </div>
                )}
              </div>
            )}
          </div>

          <hr
            className={
              theme === "dark" ? "border-secondary opacity-25" : "opacity-25"
            }
          />

          <div onClick={(e) => e.stopPropagation()}>
            <PostActions
              postId={post._id}
              likedByCurrentUser={post.likedByCurrentUser}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              repostsCount={post.repostsCount}
              onCommentClick={handleCommentClick}
              onRepostClick={handleDirectRepost}
              onQuoteClick={handleQuoteClick}
            />
          </div>
        </div>
      </div>

      <CommentModal
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
      />

      <QuoteModal
        post={post}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
      />
    </>
  );
}
