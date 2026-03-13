import { useEffect, useState, useCallback } from "react";
import { getCommentsByPostId, getReplies } from "../../api/comment.api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import CommentCard from "./CommentCard";
import Loading from "../Loading";

export default function CommentList({
  postId,
  commentId,
  refreshTrigger,
  onCommentDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchComments = useCallback(async () => {
    if (!postId && !commentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let res;

      if (commentId) {
        res = await getReplies(commentId);
      } else {
        res = await getCommentsByPostId(postId);
      }

      const rawComments = Array.isArray(res.data) ? res.data : [];

      const formattedComments = rawComments.map((comment) => {
        return {
          ...comment,
          userId: comment.user?._id || comment.userId,
          username: comment.user?.username || "Kullanıcı",
          profileImage: comment.user?.profileImage,

          image: comment.image
            ? comment.image.startsWith("http")
              ? comment.image
              : `http://localhost:5000${comment.image}`
            : null,

          likesCount: comment.likesCount !== undefined ? comment.likesCount : 0,
          likedByCurrentUser: !!comment.likedByCurrentUser,
          isRepostedByMe: !!comment.isRepostedByMe,
          repostsCount: comment.repostsCount || 0,
          isRepost: !!comment.isRepost,

          collectionIds: comment.collectionIds || [],
          isSavedByMe: !!comment.isSavedByMe,

          isOwner: currentUserId
            ? comment.user?._id?.toString() === currentUserId.toString() ||
              comment.userId?.toString() === currentUserId.toString()
            : false,
        };
      });

      setComments(formattedComments);
    } catch (err) {
      console.error("Yorumlar yüklenirken hata:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId, commentId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger]);

  const handleCommentUpdate = () => {
    fetchComments();
    onCommentDeleted?.();
  };

  if (loading) return <Loading message="Yorumlar Yükleniyor..." />;

  return (
    <div
      className={`comment-list-section p-0 ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >
      {comments.length === 0 ? (
        <div className="p-5 text-center text-secondary">
          <p>Henüz yanıt yok. İlk yanıtı sen gönder!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div
            key={comment._id}
            className="border-bottom border-secondary border-opacity-10"
          >
            <CommentCard comment={comment} onUpdate={handleCommentUpdate} />
          </div>
        ))
      )}
    </div>
  );
}
