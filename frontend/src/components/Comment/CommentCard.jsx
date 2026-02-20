// import { useState, useEffect } from "react";
// import { useTheme } from "../../context/ThemeContext";
// import { formatRelativeTime } from "../Component/DateInfo";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// import { deleteComment, addComment } from "../../api/comment.api";
// import { repostContent } from "../../api/post.api";
// import MeatballsMenu from "../Component/MeatballsMenu";
// import UserInfo from "../Component/UserInfo";
// import PostContent from "../Component/PostContent";
// /*import CommentActions from "../Comment/CommentActions";*/
// import ContentActions from "../Component/Actions/ContentActions";
// import CommentModal from "../Comment/CommentModal";
// import QuoteModal from "../Component/QuoteModal";

// import "../../styles/PostCard.css";

// export default function CommentCard({
//   comment,
//   onUpdate,
//   isDetailView = false,
// }) {
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
//   const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

//   const { theme } = useTheme();
//   const { user: currentUser } = useAuth();
//   const navigate = useNavigate();

//   const [localRepliesCount, setLocalRepliesCount] = useState(
//     comment?.repliesCount || 0,
//   );

//   useEffect(() => {
//     setLocalRepliesCount(comment?.repliesCount || 0);
//   }, [comment?.repliesCount]);

//   if (!comment) return null;

//   const handleCardClick = () => {
//     if (isDetailView || isDeleting) return;
//     navigate(`/comment/${comment._id}`);
//   };

//   const handleReplyClick = (e) => {
//     if (e) e.stopPropagation();
//     if (!currentUser) return navigate("/login");
//     setIsReplyModalOpen(true);
//   };

//   const handleRepostClick = async () => {
//     if (!currentUser) return navigate("/login");

//     try {
//       await repostContent(comment._id, { type: "comment" });

//       onUpdate?.();
//     } catch (error) {
//       console.error("Yorum repost hatası:", error);
//     }
//   };

//   const handleQuoteClick = () => {
//     if (!currentUser) return navigate("/login");
//     setIsQuoteModalOpen(true);
//   };

//   const handleDelete = async (e) => {
//     if (e) e.stopPropagation();
//     if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;

//     try {
//       setIsDeleting(true);
//       await deleteComment(comment._id);
//       onUpdate?.(isDetailView);
//     } catch (error) {
//       console.error("Silme hatası:", error);
//       alert("Yorum silinemedi");
//       setIsDeleting(false);
//     }
//   };

//   const handleReplySubmit = async (replyData) => {
//     const { text, image } = replyData;
//     const formData = new FormData();
//     formData.append("text", text);
//     if (image) formData.append("image", image);
//     formData.append("parentComment", comment._id);

//     try {
//       const mainPostId = comment.post || comment.postId;
//       if (!mainPostId) return console.error("Post ID bulunamadı!");

//       await addComment(mainPostId, formData);
//       setIsReplyModalOpen(false);
//       onUpdate?.();
//     } catch (error) {
//       console.error("Yanıta yanıt hatası:", error);
//     }
//   };

//   const handleQuoteSubmit = async (quoteData) => {
//     const { text, image } = quoteData;
//     const formData = new FormData();
//     formData.append("text", text || "");
//     formData.append("type", "comment");
//     if (image) formData.append("image", image);

//     try {
//       await repostContent(comment._id, formData);
//       setIsQuoteModalOpen(false);
//       onUpdate?.();
//     } catch (error) {
//       console.error("Yorum alıntı hatası:", error);
//     }
//   };

//   return (
//     <>
//       <div
//         onClick={handleCardClick}
//         className={`post-card mx-auto w-100 ${theme === "dark" ? "dark" : ""} ${
//           isDeleting ? "opacity-50" : ""
//         } ${!isDetailView ? "clickable-card" : ""}`}
//         style={{ cursor: !isDetailView ? "pointer" : "default" }}
//       >
//         <div className="card-body">
//           {comment.isRepostedByMe && (
//             <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center ms-5">
//               <i className="bi bi-repeat me-2"></i>
//               <span>Repost</span>
//             </div>
//           )}

//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <UserInfo
//               userId={comment.userId || comment.user?._id}
//               username={comment.username || comment.user?.username}
//               profileImage={comment.profileImage || comment.user?.profileImage}
//               createdAt={comment.createdAt}
//               formatTime={formatRelativeTime}
//             />
//             <div onClick={(e) => e.stopPropagation()}>
//               <MeatballsMenu
//                 isOwner={comment.isOwner}
//                 onDelete={handleDelete}
//               />
//             </div>
//           </div>

//           <div className="post-container">
//             <PostContent text={comment.text} image={comment.image} />
//           </div>

//           <hr
//             className={
//               theme === "dark" ? "border-secondary opacity-25" : "opacity-25"
//             }
//           />

//           <div onClick={(e) => e.stopPropagation()}>
//             <ContentActions
//               id={comment._id}
//               type="comment" // "comment" olduğunu belirttik
//               likedByCurrentUser={comment.likedByCurrentUser}
//               likesCount={comment.likesCount}
//               count={localRepliesCount} // repliesCount -> count oldu
//               repostsCount={comment.repostsCount || 0}
//               isRepostedByMe={comment.isRepostedByMe}
//               isSavedByMe={comment.isSavedByMe}
//               onActionClick={handleReplyClick} // onReplyClick -> onActionClick oldu
//               onRepostClick={handleRepostClick}
//               onQuoteClick={handleQuoteClick}
//             />
//           </div>
//         </div>
//       </div>

//       <CommentModal
//         post={comment}
//         isOpen={isReplyModalOpen}
//         onClose={() => setIsReplyModalOpen(false)}
//         onSubmit={handleReplySubmit}
//       />
//       <QuoteModal
//         post={comment}
//         isOpen={isQuoteModalOpen}
//         onClose={() => setIsQuoteModalOpen(false)}
//         onSubmit={handleQuoteSubmit}
//       />
//     </>
//   );
// }

import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { deleteComment, addComment } from "../../api/comment.api";
import { repostContent } from "../../api/post.api";

// Yeni Ortak Bileşenlerimiz
import CardLayout from "../Layout/CardLayout";
import ContentActions from "../Component/Actions/ContentActions";

import MeatballsMenu from "../Component/MeatballsMenu";
import UserInfo from "../Component/UserInfo";
import PostContent from "../Component/PostContent";
import CommentModal from "../Comment/CommentModal";
import QuoteModal from "../Component/QuoteModal";

export default function CommentCard({
  comment,
  onUpdate,
  isDetailView = false,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

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

  const handleCardClick = () => {
    if (isDetailView || isDeleting) return;
    navigate(`/comment/${comment._id}`);
  };

  const handleReplyClick = (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) return navigate("/login");
    setIsReplyModalOpen(true);
  };

  const handleRepostClick = async () => {
    if (!currentUser) return navigate("/login");
    try {
      await repostContent(comment._id, { type: "comment" });
      onUpdate?.();
    } catch (error) {
      console.error("Yorum repost hatası:", error);
    }
  };

  const handleQuoteClick = () => {
    if (!currentUser) return navigate("/login");
    setIsQuoteModalOpen(true);
  };

  const handleDelete = async (e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;

    try {
      setIsDeleting(true);
      await deleteComment(comment._id);
      onUpdate?.(isDetailView);
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
    formData.append("parentComment", comment._id);

    try {
      const mainPostId = comment.post || comment.postId;
      if (!mainPostId) return console.error("Post ID bulunamadı!");

      await addComment(mainPostId, formData);
      setIsReplyModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Yanıta yanıt hatası:", error);
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
      console.error("Yorum alıntı hatası:", error);
    }
  };

  return (
    <>
      <CardLayout
        onClick={handleCardClick}
        theme={theme}
        isDeleting={isDeleting}
        clickable={!isDetailView}
        isReply={!!comment.parentComment} // parentComment varsa mavi çizgi çekilir
      >
        {/* Repost Göstergesi */}
        {comment.isRepostedByMe && (
          <div className="repost-indicator mb-1 small text-secondary fw-bold d-flex align-items-center">
            <i className="bi bi-repeat me-2"></i>
            <span>Repostladın</span>
          </div>
        )}

        {/* Üst Kısım: Kullanıcı ve Menü */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <UserInfo
            userId={comment.userId || comment.user?._id}
            username={comment.username || comment.user?.username}
            profileImage={comment.profileImage || comment.user?.profileImage}
            createdAt={comment.createdAt}
            formatTime={formatRelativeTime}
          />
          <div onClick={(e) => e.stopPropagation()}>
            <MeatballsMenu isOwner={comment.isOwner} onDelete={handleDelete} />
          </div>
        </div>

        {/* Orta Kısım: Yorum İçeriği */}
        <div className="post-container">
          <PostContent text={comment.text} image={comment.image} />
        </div>

        {/* Alt Kısım: Aksiyonlar Çizgisi */}
        <hr
          className={`card-separator ${theme === "dark" ? "opacity-25" : "opacity-10"}`}
        />

        <div onClick={(e) => e.stopPropagation()}>
          <ContentActions
            id={comment._id}
            type="comment"
            likedByCurrentUser={comment.likedByCurrentUser}
            likesCount={comment.likesCount}
            count={localRepliesCount}
            repostsCount={comment.repostsCount || 0}
            isRepostedByMe={comment.isRepostedByMe}
            isSavedByMe={comment.isSavedByMe}
            onActionClick={handleReplyClick}
            onRepostClick={handleRepostClick}
            onQuoteClick={handleQuoteClick}
          />
        </div>
      </CardLayout>

      {/* Modallar */}
      <CommentModal
        post={comment}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
      />
      <QuoteModal
        post={comment}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
      />
    </>
  );
}
