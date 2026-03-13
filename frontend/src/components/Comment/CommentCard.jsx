import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../hooks/useAuth";

import {
  deleteComment,
  addComment,
  updateComment,
} from "../../api/comment.api";
import { repostContent } from "../../api/post.api";
import { followUser } from "../../api/user.api";

import CardLayout from "../Layout/CardLayout";
import ContentActions from "../Component/Actions/ContentActions";
import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import CommentModal from "../Comment/CommentModal";
import QuoteModal from "../Component/QuoteModal";
import EditPostModal from "../Post/EditPostModal";
import RepostCard from "../Post/RepostCard";

export default function CommentCard({
  comment,
  onUpdate,
  isDetailView = false,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [localRepliesCount, setLocalRepliesCount] = useState(
    comment?.repliesCount || 0,
  );

  useEffect(() => {
    setLocalRepliesCount(comment?.repliesCount || 0);
  }, [comment?.repliesCount]);

  if (!comment) return null;

  const isQuote = !!(comment.text?.trim() || comment.image) && comment.isRepost;
  const isDirectRepost =
    comment.isRepost &&
    !isQuote &&
    (comment.parentPost || comment.parentComment);

  const displayData =
    isDirectRepost && comment.parentComment ? comment.parentComment : comment;

  const isOwner = !!(
    currentUser &&
    (comment.user?._id === currentUser._id ||
      comment.userId === currentUser._id)
  );

  if (isDirectRepost && !comment.parentPost && !comment.parentComment) {
    return null;
  }

  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;
    navigate(`/comment/${comment._id}`);
  };

  const handleFollowToggle = async (targetId) => {
    if (!currentUser) return navigate("/login");
    try {
      await followUser(targetId);
      onUpdate?.();
    } catch (error) {
      console.error("Takip işlemi hatası:", error);
    }
  };

  const handleReplyClick = (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) return navigate("/login");
    setIsReplyModalOpen(true);
  };

  const handleRepostClick = async () => {
    if (!currentUser) return navigate("/login");
    try {
      const targetId =
        isDirectRepost && comment.parentComment
          ? comment.parentComment._id
          : comment._id;
      await repostContent(targetId, { type: "comment" });
      onUpdate?.();
    } catch (error) {
      console.error("Yorum repost hatası:", error);
    }
  };

  const handleQuoteClick = () => {
    if (!currentUser) return navigate("/login");
    const quoteTarget = isDirectRepost ? comment.parentComment : comment;
    setIsQuoteModalOpen(quoteTarget);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async (e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;
    try {
      setIsDeleting(true);
      await deleteComment(comment._id);
      onUpdate?.(isDetailView);
    } catch (error) {
      setIsDeleting(false);
      alert("Yorum silinemedi");
    }
  };

  const handleReplySubmit = async (replyData) => {
    const { text, image } = replyData;
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);
    formData.append("parentComment", comment._id);

    try {
      const mainPostId = comment.post || comment.postId;
      await addComment(mainPostId, formData);
      setIsReplyModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuoteSubmit = async (quoteData) => {
    const { text, image } = quoteData;
    const formData = new FormData();
    formData.append("text", text || "");
    formData.append("type", "comment");
    if (image) formData.append("image", image);
    try {
      await repostContent(comment._id, formData);
      setIsQuoteModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async (editData) => {
    try {
      const formData = new FormData();
      formData.append("text", editData.text);
      if (editData.image) {
        formData.append("image", editData.image);
      } else if (editData.imageDeleted) {
        formData.append("removeImage", "true");
      }

      await updateComment(comment._id, formData);
      setIsEditModalOpen(false);
      onUpdate?.();
    } catch (error) {
      alert("Yorum güncellenemedi.");
    }
  };

  return (
    <>
      <CardLayout
        onClick={handleCardClick}
        theme={theme}
        isDeleting={isDeleting}
        clickable={!isDetailView}
        isReply={!!comment.parentComment && !comment.isRepost}
      >
        {isDirectRepost && (
          <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center px-3 pt-2">
            <i className="bi bi-repeat me-2"></i>
            <span>
              {isOwner ? "Sen paylaştın" : `${comment.username} paylaştı`}
            </span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2 px-3 pt-2">
          <UserInfo
            userId={displayData.userId || displayData.user?._id}
            username={displayData.username || displayData.user?.username}
            profileImage={
              displayData.profileImage || displayData.user?.profileImage
            }
            createdAt={displayData.createdAt}
            formatTime={formatRelativeTime}
            allUserData={displayData}
          />
          <div onClick={(e) => e.stopPropagation()}>
            <MeatballsMenu
              isOwner={isOwner}
              onDelete={handleDelete}
              onEdit={handleEditClick}
              targetUser={{
                _id: displayData.userId || displayData.user?._id,
                username: displayData.username || displayData.user?.username,
                isFollowing: displayData.isFollowingByMe,
              }}
              onFollowToggle={handleFollowToggle}
            />
          </div>
        </div>

        <div className="post-container px-3">
          <PostContent text={comment.text} image={comment.image} />

          {comment.isRepost && (
            <div className="mt-2 quote-wrapper">
              {comment.parentPost ? (
                <RepostCard post={comment.parentPost} isComment={false} />
              ) : comment.parentComment ? (
                <RepostCard post={comment.parentComment} isComment={true} />
              ) : (
                <RepostCard post={null} />
              )}
            </div>
          )}
        </div>

        <hr
          className={`card-separator mx-3 ${theme === "dark" ? "opacity-25" : "opacity-10"}`}
        />

        <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
          <ContentActions
            id={comment._id}
            type="comment"
            likedByCurrentUser={comment.likedByCurrentUser}
            likesCount={comment.likesCount}
            count={localRepliesCount}
            repostsCount={comment.repostsCount || 0}
            isRepostedByMe={comment.isRepostedByMe}
            isSavedByMe={comment.isSavedByMe}
            collectionIds={comment.collectionIds || []}
            onActionClick={handleReplyClick}
            onRepostClick={handleRepostClick}
            onQuoteClick={handleQuoteClick}
          />
        </div>
      </CardLayout>

      <CommentModal
        post={comment}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
      />
      <QuoteModal
        post={isDirectRepost ? comment.parentComment : comment}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
      />
      <EditPostModal
        post={comment}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
