import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommentById } from "../api/comment.api";
import PostCard from "../components/Post/PostCard";
import CommentCard from "../components/Comment/CommentCard";
import CommentList from "../components/Comment/CommentList";
import RightAside from "../components/Layout/RightAside";
import { useTheme } from "../context/ThemeContext";
import Loading from "../components/Loading";

export default function CommentPage() {
  const { commentId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Veriyi çeken ana fonksiyon
  const fetchCommentDetails = useCallback(async () => {
    try {
      if (!commentId || commentId === "undefined") return;

      const res = await getCommentById(commentId);
      // Backend'den gelen veriyi güvenli bir şekilde alıyoruz
      const incomingData = res.data?.data || res.data;
      setComment(incomingData);
    } catch (error) {
      console.error("Yorum yüklenemedi:", error);
      if (error.response?.status === 404) {
        alert("Bu yanıt silinmiş veya mevcut değil.");
        navigate("/home");
      }
    } finally {
      setLoading(false);
    }
  }, [commentId, navigate]);

  useEffect(() => {
    fetchCommentDetails();
  }, [fetchCommentDetails, refreshTrigger]);

  const handleUpdateAll = (isDeleted = false) => {
    if (isDeleted === true) {
      // Eğer baktığımız yorum silindiyse bir önceki sayfaya dön
      navigate(-1);
    } else {
      // Beğeni veya yeni yanıt gelirse listeyi yenile
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  if (loading) return <Loading message="Yanıt Yükleniyor..." />;
  if (!comment) return <div className="p-4 text-center">Yanıt bulunamadı.</div>;

  return (
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div
            className={`col-12 col-md-8 col-lg-6 border-start border-end min-vh-100 p-0 ${
              isDark ? "border-secondary" : ""
            }`}
          >
            {/* Header */}
            <div
              className={`d-flex align-items-center p-3 sticky-top ${
                isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
              }`}
              style={{ backdropFilter: "blur(10px)", zIndex: 10 }}
            >
              <button
                className={`btn border-0 p-0 me-3 ${isDark ? "text-white" : "text-dark"}`}
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </button>
              <h5 className="mb-0 fw-bold">Yanıtla</h5>
            </div>

            {/* Üst Bağlam: Eğer bu bir yorumsa, bağlı olduğu Postu en üstte gösteririz */}
            {comment.post && (
              <div className="border-bottom border-secondary border-opacity-10 opacity-50">
                <PostCard post={comment.post} isDetailView={false} />
              </div>
            )}

            {/* Odaklanılan Yorum (Asıl İçerik) */}
            <div className="border-bottom border-secondary border-opacity-10">
              <CommentCard
                comment={comment}
                onUpdate={handleUpdateAll}
                isDetailView={true} // Tıklanabilirliği kapatır
              />
            </div>

            {/* Yanıtlar Başlığı */}
            <div
              className={`p-3 border-bottom border-secondary border-opacity-10 ${
                isDark ? "bg-dark bg-opacity-25" : "bg-light"
              }`}
            >
              <span className="fw-bold small text-secondary text-uppercase">
                Yanıtlar
              </span>
            </div>

            {/* Bu Yoruma Gelen Alt Yanıtlar (Yorumun Yorumları) */}
            <CommentList
              parentCommentId={commentId} // Alt yorumları çekmek için ID
              postId={comment.post?._id} // Aynı post altında kalmak için
              refreshTrigger={refreshTrigger}
              onCommentDeleted={() => handleUpdateAll(false)}
            />
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <RightAside />
          </div>
        </div>
      </div>
    </div>
  );
}
