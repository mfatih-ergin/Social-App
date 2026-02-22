import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost, repostContent } from "../../api/post.api";
import { addComment } from "../../api/comment.api";
import { followUser } from "../../api/user.api";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../context/AuthContext";

import CardLayout from "../Layout/CardLayout";
import ContentActions from "../Component/Actions/ContentActions";
import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import CommentModal from "../Comment/CommentModal";
import QuoteModal from "../Component/QuoteModal";
import RepostCard from "./RepostCard";

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
      const isParentPost = !!post.parentPost;
      const targetId = isParentPost
        ? post.parentPost?._id || post.parentPost
        : post.parentComment?._id || post.parentComment;

      if (targetId) {
        navigate(isParentPost ? `/post/${targetId}` : `/comment/${targetId}`);
      }
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

  const handleFollowToggle = async (targetId, isCurrentlyFollowing) => {
    if (!user) return navigate("/login");

    try {
      await followUser(targetId);
      onUpdate?.();
    } catch (error) {
      console.error("Takip işlemi hatası:", error);
      alert("İşlem gerçekleştirilemedi.");
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
      <CardLayout theme={theme} isDeleting={true} clickable={false}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-secondary small d-flex align-items-center">
            <i className="bi bi-exclamation-circle me-2"></i>
            <span>İçerik artık mevcut değil</span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <MeatballsMenu isOwner={isOwner} onDelete={handleDelete} />
          </div>
        </div>
        <div className="py-2">
          <p className="text-secondary fst-italic mb-0">
            Orijinal içerik silindi.
          </p>
        </div>
      </CardLayout>
    );
  }

  return (
    <>
      <CardLayout
        onClick={handleCardClick}
        theme={theme}
        isDeleting={isDeleting}
        clickable={!isDetailView}
      >
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
            <MeatballsMenu
              isOwner={isOwner}
              onDelete={handleDelete}
              targetUser={{
                _id: displayData.user?._id || displayData.userId,
                username: displayData.user?.username || displayData.username,
                isFollowing: displayData.isFollowingByMe,
              }}
              onFollowToggle={handleFollowToggle}
            />
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
          className={`card-separator ${theme === "dark" ? "opacity-25" : "opacity-10"}`}
        />

        <div onClick={(e) => e.stopPropagation()}>
          <ContentActions
            id={displayData._id}
            type="post"
            likedByCurrentUser={displayData.likedByCurrentUser}
            likesCount={displayData.likesCount}
            count={displayData.commentsCount}
            repostsCount={displayData.repostsCount}
            isSavedByMe={displayData.isSavedByMe || post.isSavedByMe}
            collectionIds={
              displayData.collectionIds || post.collectionIds || []
            }
            isRepostedByMe={displayData.isRepostedByMe || post.isRepostedByMe}
            onActionClick={handleCommentClick}
            onRepostClick={handleDirectRepost}
            onQuoteClick={handleQuoteClick}
          />
        </div>
      </CardLayout>

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
