/*import { useEffect, useState } from "react";
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
}*/

import { useEffect, useState, useCallback } from "react";
import { getCommentsByPostId, getReplies } from "../../api/comment.api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import CommentCard from "./CommentCard";
import Loading from "../Loading";

export default function CommentList({
  postId,
  commentId, // Yeni: Yanıtları çekmek için eklendi
  refreshTrigger,
  onCommentDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchComments = useCallback(async () => {
    // Eğer ikisi de yoksa isteği durdur ve loading'i kapat
    if (!postId && !commentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let res;

      if (commentId) {
        // Eğer bir yorumun detayındaysak o yorumun yanıtlarını çek
        res = await getReplies(commentId);
      } else {
        // Eğer bir postun detayındaysak o postun yorumlarını çek
        res = await getCommentsByPostId(postId);
      }

      const rawComments = Array.isArray(res.data) ? res.data : [];

      const formattedComments = rawComments.map((comment) => ({
        ...comment,
        // Veri yapısı uyumluluğu için düzleştirme
        userId: comment.user?._id || comment.userId,
        username: comment.user?.username || "Kullanıcı",
        profileImage: comment.user?.profileImage,
        // Resim URL kontrolü
        image: comment.image
          ? comment.image.startsWith("http")
            ? comment.image
            : `http://localhost:5000${comment.image}`
          : null,
        likesCount: comment.likes?.length || 0,
        // Sahiplik kontrolü
        isOwner:
          currentUserId &&
          (comment.user?._id?.toString() === currentUserId.toString() ||
            comment.userId?.toString() === currentUserId.toString()),
        // Beğeni kontrolü
        likedByCurrentUser: currentUserId
          ? comment.likes?.some(
              (id) => id.toString() === currentUserId.toString(),
            )
          : false,
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error("Yorumlar yüklenirken hata:", err);
      setComments([]); // Hata durumunda listeyi temizle
    } finally {
      setLoading(false); // Her durumda loading ekranını kapat
    }
  }, [postId, commentId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger]);

  const handleCommentUpdate = () => {
    fetchComments();
    onCommentDeleted?.();
  };

  if (loading) return <Loading message="Yanıtlar Yükleniyor..." />;

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
