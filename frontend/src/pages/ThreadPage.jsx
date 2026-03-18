import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../api/post.api";
import { getCommentById } from "../api/comment.api";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/Post/PostCard";
import CommentCard from "../components/Comment/CommentCard";
import CommentList from "../components/Comment/CommentList";
import { useTheme } from "../hooks/useTheme";
import Loading from "../components/Component/Loading";

export default function PostPage({ type = "post" }) {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (type === "post") {
        res = await getPostById(contentId);
      } else {
        res = await getCommentById(contentId);
      }

      const rawData = res.data;

      const formattedData = {
        ...rawData,
        likesCount: rawData.likesCount !== undefined ? rawData.likesCount : 0,
        likedByCurrentUser: !!rawData.likedByCurrentUser,
        userId: rawData.user?._id || rawData.userId,
        username: rawData.user?.username || rawData.username,
        profileImage: rawData.user?.profileImage || rawData.profileImage,
        image:
          rawData.image && !rawData.image.startsWith("http")
            ? `http://localhost:5000${rawData.image}`
            : rawData.image,
        isOwner: currentUser
          ? rawData.user?._id?.toString() === currentUserId?.toString() ||
            rawData.userId?.toString() === currentUserId?.toString()
          : false,
        isRepostedByMe: !!rawData.isRepostedByMe,
        isRepost: !!rawData.isRepost,
        parentPost: rawData.parentPost || null,
        parentComment: rawData.parentComment || null,
      };

      setContent(formattedData);

      document.title = `${formattedData.username} adlı kullanıcının ${type === "post" ? "gönderisi" : "yanıtı"} / ${import.meta.env.VITE_APP_NAME}`;
    } catch (error) {
      console.error("İçerik yüklenemedi:", error);
      if (error.response?.status === 404) {
        navigate("/home");
      }
    } finally {
      setLoading(false);
    }
  }, [contentId, navigate, type, currentUserId, currentUser]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails, refreshTrigger]);

  const handleUpdateAll = (isDeleted = false) => {
    if (isDeleted) {
      navigate("/home");
    } else {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  if (loading) return <Loading message="Yükleniyor..." />;
  if (!content)
    return <div className="p-4 text-center">İçerik bulunamadı.</div>;

  return (
    <div>
      <div className="main-content-area">
        {type === "post" ? (
          <PostCard
            post={content}
            onUpdate={handleUpdateAll}
            isDetailView={true}
          />
        ) : (
          <CommentCard
            comment={content}
            onUpdate={handleUpdateAll}
            isDetailView={true}
          />
        )}
      </div>

      <div
        className={`p-3 border-bottom ${currentUser && theme === "dark" ? "bg-dark bg-opacity-25 border-secondary border-opacity-25" : "bg-light border-light"}`}
      >
        <span className="fw-bold small text-secondary text-uppercase">
          Yanıtlar
        </span>
      </div>

      <CommentList
        postId={
          type === "post"
            ? content.isRepost && !content.text && content.parentPost
              ? content.parentPost._id
              : contentId
            : null
        }
        commentId={
          type === "comment"
            ? contentId
            : content.isRepost && !content.text && content.parentComment
              ? content.parentComment._id
              : null
        }
        refreshTrigger={refreshTrigger}
        onCommentDeleted={() => handleUpdateAll(false)}
      />
    </div>
  );
}
