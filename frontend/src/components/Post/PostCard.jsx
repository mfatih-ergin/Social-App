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

  const isDirectRepost = post.isRepost && !post.text;
  const displayData = isDirectRepost
    ? post.parentPost || post.parentComment
    : post;

  const isOwner = !!(
    user &&
    (post.user?._id === user._id || post.userId === user._id)
  );

  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;
    if (isDirectRepost) {
      const targetId =
        post.parentPost?._id ||
        post.parentPost ||
        post.parentComment?._id ||
        post.parentComment;
      navigate(post.parentPost ? `/post/${targetId}` : `/comment/${targetId}`);
    } else {
      navigate(`/post/${post._id}`);
    }
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
    if (!user) return navigate("/login");
    setIsCommentModalOpen(true);
  };

  const handleDirectRepost = async () => {
    if (!user) return navigate("/login");
    try {
      const type = displayData.post || post.parentComment ? "comment" : "post";
      await repostContent(displayData._id, { type });
      onUpdate?.();
    } catch (error) {
      console.error("Repost işlemi başarısız:", error);
    }
  };

  const handleQuoteClick = () => {
    if (!user) return navigate("/login");
    setIsQuoteModalOpen(true);
  };

  const handleCommentSubmit = async (commentData) => {
    const { text, image } = commentData;
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);
    try {
      await addComment(displayData._id, formData);
      setIsCommentModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const handleQuoteSubmit = async (quoteData) => {
    const { text, image } = quoteData;
    const formData = new FormData();
    formData.append("text", text || "");
    formData.append(
      "type",
      displayData.post || post.parentComment ? "comment" : "post",
    );
    if (image) formData.append("image", image);
    try {
      await repostContent(displayData._id, formData);
      setIsQuoteModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  if (!displayData) {
    return (
      <div
        className={`post-card mx-auto w-100 ${theme === "dark" ? "dark" : ""} opacity-75`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-secondary small d-flex align-items-center">
              <i className="bi bi-exclamation-circle me-2"></i>
              <span>İçerik artık mevcut değil</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <MeatballsMenu isOwner={isOwner} onDelete={handleDelete} />
            </div>
          </div>
          <div className="post-container py-3">
            <p className="text-secondary fst-italic mb-0">
              Orijinal içerik silindi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`post-card mx-auto w-100 ${theme === "dark" ? "dark" : ""} ${isDeleting ? "opacity-50" : ""} ${!isDetailView ? "clickable-card" : ""}`}
      >
        <div className="card-body">
          {isDirectRepost && isOwner && (
            <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center">
              <i className="bi bi-repeat me-2"></i>
              <span>Repost</span>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-2">
            <UserInfo
              userId={displayData.user?._id || displayData.userId}
              username={displayData.user?.username || displayData.username}
              profileImage={
                displayData.user?.profileImage || displayData.profileImage
              }
              createdAt={displayData.createdAt}
              formatTime={formatRelativeTime}
            />
            <div onClick={(e) => e.stopPropagation()}>
              <MeatballsMenu isOwner={isOwner} onDelete={handleDelete} />
            </div>
          </div>

          <div className="post-container">
            <PostContent
              text={isDirectRepost ? displayData.text : post.text}
              image={isDirectRepost ? displayData.image : post.image}
            />
            {post.isRepost && post.text && (
              <div className="mt-2 quote-wrapper">
                {post.parentPost ? (
                  <RepostCard post={post.parentPost} isComment={false} />
                ) : post.parentComment ? (
                  <RepostCard post={post.parentComment} isComment={true} />
                ) : null}
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
              postId={displayData._id}
              likedByCurrentUser={displayData.likedByCurrentUser}
              likesCount={displayData.likesCount}
              commentsCount={displayData.commentsCount}
              repostsCount={displayData.repostsCount}
              onCommentClick={handleCommentClick}
              onRepostClick={handleDirectRepost}
              onQuoteClick={handleQuoteClick}
              isSavedByMe={displayData.isSavedByMe || post.isSavedByMe}
              isRepostedByMe={
                isDirectRepost
                  ? true
                  : displayData.isRepostedByMe || post.isRepostedByMe
              }
            />
          </div>
        </div>
      </div>

      <CommentModal
        post={displayData}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
      />
      <QuoteModal
        post={displayData}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
      />
    </>
  );
}
