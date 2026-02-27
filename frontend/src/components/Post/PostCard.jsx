import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost, repostContent, updatePost } from "../../api/post.api";
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
import EditPostModal from "../Post/EditPostModal";
import RepostCard from "./RepostCard";

export default function PostCard({ post, onUpdate, isDetailView = false }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!post) return null;

  const isQuote = !!(post.text?.trim() || post.image);
  const isDirectRepost = post.isRepost && !isQuote;

  const displayData =
    isDirectRepost && post.parentPost ? post.parentPost : post;

  const isOwner = !!(
    user &&
    (post.user?._id === user._id || post.userId === user._id)
  );

  if (isDirectRepost && !post.parentPost && !post.parentComment) {
    return null;
  }

  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;

    if (isDirectRepost) {
      const targetId = post.parentPost?._id || post.parentComment?._id;
      const targetPath = post.parentPost
        ? `/post/${targetId}`
        : `/comment/${targetId}`;
      if (targetId) {
        navigate(targetPath);
        return;
      }
    }

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

  const handleEditClick = () => {
    if (isDirectRepost) {
      alert("Bu tür bir gönderi düzenlenemez.");
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (editData) => {
    try {
      const formData = new FormData();
      formData.append("text", editData.text);
      if (editData.image) formData.append("image", editData.image);
      else if (editData.imageDeleted) formData.append("removeImage", "true");

      await updatePost(post._id, formData);
      setIsEditModalOpen(false);
      onUpdate?.();
    } catch (error) {
      alert("Güncelleme başarısız.");
    }
  };

  const handleFollowToggle = async (targetId) => {
    if (!user) return navigate("/login");
    try {
      await followUser(targetId);
      onUpdate?.();
    } catch (error) {
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
      await repostContent(post._id, { type: "post" });
      onUpdate?.();
    } catch (error) {
      console.error("Repost hatası:", error);
    }
  };

  const handleQuoteClick = () => {
    if (!user) return navigate("/login");
    const quoteTarget = isDirectRepost
      ? post.parentPost || post.parentComment
      : post;
    setIsQuoteModalOpen(quoteTarget);
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
      console.error(error);
    }
  };

  const handleQuoteSubmit = async (quoteData) => {
    const { text, image } = quoteData;
    const formData = new FormData();
    formData.append("text", text || "");
    formData.append("type", "post");
    if (image) formData.append("image", image);
    try {
      await repostContent(post._id, formData);
      setIsQuoteModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <CardLayout
        onClick={handleCardClick}
        theme={theme}
        isDeleting={isDeleting}
        clickable={!isDetailView}
      >
        {isDirectRepost && (
          <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center px-3 pt-2">
            <i className="bi bi-repeat me-2"></i>
            <span>
              {isOwner ? "Sen paylaştın" : `${post.username} paylaştı`}
            </span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2 px-3 pt-2">
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
              onEdit={handleEditClick}
              targetUser={{
                _id: displayData.user?._id || displayData.userId,
                username: displayData.user?.username || displayData.username,
                isFollowing: displayData.isFollowingByMe,
              }}
              onFollowToggle={handleFollowToggle}
            />
          </div>
        </div>

        <div className="post-container px-3">
          <PostContent text={post.text} image={post.image} />

          {post.isRepost && (
            <div className="mt-2 quote-wrapper">
              {post.parentPost ? (
                <RepostCard post={post.parentPost} isComment={false} />
              ) : post.parentComment ? (
                <RepostCard post={post.parentComment} isComment={true} />
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
            id={
              isDirectRepost
                ? post.parentPost?._id || post.parentComment?._id
                : post._id
            }
            type={isDirectRepost && post.parentComment ? "comment" : "post"}
            repostsCount={
              isDirectRepost
                ? post.parentPost?.repostsCount ||
                  post.parentComment?.repostsCount ||
                  0
                : post.repostsCount || 0
            }
            likesCount={
              isDirectRepost
                ? post.parentPost?.likesCount ||
                  post.parentComment?.likesCount ||
                  0
                : post.likesCount || 0
            }
            count={
              isDirectRepost
                ? post.parentPost?.commentsCount ||
                  post.parentComment?.repliesCount ||
                  0
                : post.commentsCount || 0
            }
            isRepostedByMe={post.isRepostedByMe}
            likedByCurrentUser={
              isDirectRepost
                ? post.parentPost?.likedByCurrentUser ||
                  post.parentComment?.likedByCurrentUser
                : post.likedByCurrentUser
            }
            isSavedByMe={
              isDirectRepost
                ? post.parentPost?.isSavedByMe ||
                  post.parentComment?.isSavedByMe
                : post.isSavedByMe
            }
            collectionIds={
              isDirectRepost
                ? post.parentPost?.collectionIds ||
                  post.parentComment?.collectionIds ||
                  []
                : post.collectionIds || []
            }
            onActionClick={handleCommentClick}
            onRepostClick={handleDirectRepost}
            onQuoteClick={handleQuoteClick}
          />
        </div>
      </CardLayout>

      <CommentModal
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
      />
      <QuoteModal
        post={isDirectRepost ? post.parentPost || post.parentComment : post}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
      />
      <EditPostModal
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
