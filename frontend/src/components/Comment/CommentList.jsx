import { useEffect, useState } from "react";
import { getCommentsByPostId } from "../../api/comment.api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import CommentCard from "./CommentCard";
import Loading from "../Loading";

export default function CommentList({
  postId,
  refreshTrigger,
  onCommentDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await getCommentsByPostId(postId);
      const rawComments = Array.isArray(res.data) ? res.data : [];

      const formattedComments = rawComments.map((comment) => ({
        ...comment,
        userId: comment.user?._id || comment.userId,
        username: comment.user?.username || "Kullanıcı",
        profileImage: comment.user?.profileImage,
        image: comment.image ? `http://localhost:5000${comment.image}` : null,
        likesCount: comment.likes?.length || 0,
        isOwner:
          currentUserId &&
          (comment.user?._id === currentUserId ||
            comment.userId === currentUserId),
        likedByCurrentUser: currentUserId
          ? comment.likes?.includes(currentUserId)
          : false,
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error("Yorumlar yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, refreshTrigger, currentUserId]);

  const handleCommentUpdate = () => {
    fetchComments();
    onCommentDeleted?.();
  };

  if (loading) return <Loading message="Yorumlar Yükleniyor..." />;

  return (
    <div
      className={`comment-list-section ${theme === "dark" ? "bg-black" : "bg-white"}`}
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
