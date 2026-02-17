/*import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Yönlendirme için eklendi

import { deleteComment } from "../../api/comment.api";
import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import CommentActions from "../Comment/CommentActions";
import CommentModal from "../Comment/CommentModal";

import "../../styles/PostCard.css";

export default function CommentCard({ comment, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate(); // Navigate hook'unu tanımladık

  const [localRepliesCount, setLocalRepliesCount] = useState(
    comment?.repliesCount || 0,
  );

  useEffect(() => {
    setLocalRepliesCount(comment?.repliesCount || 0);
  }, [comment?.repliesCount]);

  if (!comment) return null;

  // Yorum butonuna tıklandığında çalışan fonksiyon
  const handleReplyClick = () => {
    if (!currentUser) {
      // Kullanıcı yoksa login sayfasına yönlendir
      navigate("/login");
      return;
    }
    // Kullanıcı varsa modalı aç
    setIsReplyModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;
    try {
      setIsDeleting(true);
      await deleteComment(comment._id);
      onUpdate?.();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Yorum silinemedi");
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = (replyData) => {
    console.log("Yanıt gönderiliyor:", comment._id, replyData);
    setIsReplyModalOpen(false);
    onUpdate?.();
  };

  return (
    <>
      <div
        className={`post-card mx-auto w-100 ${theme === "dark" ? "dark" : ""} ${
          isDeleting ? "opacity-50" : ""
        }`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <UserInfo
              userId={comment.userId}
              username={comment.username}
              profileImage={comment.profileImage}
              createdAt={comment.createdAt}
              formatTime={formatRelativeTime}
            />
            <div className="dropdown-container">
              {" "}
              <MeatballsMenu
                isOwner={comment.isOwner}
                onDelete={handleDelete}
              />
            </div>
          </div>

          <div className="post-container">
            <PostContent text={comment.text} image={comment.image} />
          </div>

          <hr
            className={
              theme === "dark" ? "border-secondary opacity-25" : "opacity-25"
            }
          />

          <CommentActions
            commentId={comment._id}
            likedByCurrentUser={comment.likedByCurrentUser}
            likesCount={comment.likesCount}
            repliesCount={localRepliesCount}
            onReplyClick={handleReplyClick} // Yeni kontrol fonksiyonumuzu geçtik
          />
        </div>
      </div>

      <CommentModal
        post={comment}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
      />
    </>
  );
}*/

import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { deleteComment, addComment } from "../../api/comment.api";
import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import CommentActions from "../Comment/CommentActions";
import CommentModal from "../Comment/CommentModal";

import "../../styles/PostCard.css";

export default function CommentCard({
  comment,
  onUpdate,
  isDetailView = false,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
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

  // Karta tıklandığında yorum detay sayfasına (thread) yönlendir
  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;
    // Yeni rota yapımıza uygun yönlendirme
    navigate(`/comment/${comment._id}`);
  };

  const handleReplyClick = (e) => {
    if (e) e.stopPropagation(); // Kart tıklamasını engelle
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsReplyModalOpen(true);
  };

  const handleDelete = async (e) => {
    if (e) e.stopPropagation(); // Kart tıklamasını engelle
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;

    try {
      setIsDeleting(true);
      await deleteComment(comment._id);

      // Eğer detay sayfasındaysak ve silindiyse bir üst sayfaya/home'a atabiliriz
      if (isDetailView) {
        onUpdate?.(true); // true göndererek silindiğini haber veriyoruz
      } else {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Yorum silinemedi");
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = async (replyData) => {
    const { text, image } = replyData;
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    // Yorumun altına yorum yapıldığı için bu yorumun ID'sini parent olarak ekliyoruz
    formData.append("parentComment", comment._id);

    try {
      // Bu yorumun bağlı olduğu ana postun ID'si
      // Veri yapına göre comment.post veya comment.postId olabilir, kontrol et.
      const mainPostId = comment.post || comment.postId;

      if (!mainPostId) {
        console.error("Post ID bulunamadı!");
        return;
      }

      await addComment(mainPostId, formData);
      setIsReplyModalOpen(false);
      onUpdate?.(); // Listeyi yenilemek için trigger'ı ateşler
    } catch (error) {
      console.error("Yanıta yanıt verilirken hata:", error);
      alert("Yanıt gönderilemedi.");
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <UserInfo
              userId={comment.userId || comment.user?._id}
              username={comment.username || comment.user?.username}
              profileImage={comment.profileImage || comment.user?.profileImage}
              createdAt={comment.createdAt}
              formatTime={formatRelativeTime}
            />
            <div onClick={(e) => e.stopPropagation()}>
              <MeatballsMenu
                isOwner={comment.isOwner}
                onDelete={handleDelete}
              />
            </div>
          </div>

          <div className="post-container">
            <PostContent text={comment.text} image={comment.image} />
          </div>

          <hr
            className={
              theme === "dark" ? "border-secondary opacity-25" : "opacity-25"
            }
          />

          <div onClick={(e) => e.stopPropagation()}>
            <CommentActions
              commentId={comment._id}
              likedByCurrentUser={comment.likedByCurrentUser}
              likesCount={comment.likesCount}
              repliesCount={localRepliesCount}
              onReplyClick={handleReplyClick}
            />
          </div>
        </div>
      </div>

      <CommentModal
        post={comment} // CommentModal'a veriyi paslıyoruz
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
      />
    </>
  );
}
