import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../api/post.api";
import { getCommentById } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/Post/PostCard";
import CommentCard from "../components/Comment/CommentCard";
import CommentList from "../components/Comment/CommentList";
import RightAside from "../components/Layout/RightAside";
import { useTheme } from "../context/ThemeContext";
import Loading from "../components/Loading";

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
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
    >
      <div className="container p-0" style={{ maxWidth: "1050px" }}>
        {" "}
        <div className="row g-0">
          {" "}
          <main
            className={`col-12 col-lg-7 border-start border-end p-0 ${isDark ? "border-secondary border-opacity-25" : "border-light"}`}
          >
            <div
              className={`d-flex align-items-center p-3 sticky-top ${isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"}`}
              style={{ backdropFilter: "blur(10px)", zIndex: 1050 }}
            >
              <button
                className={`btn border-0 p-0 me-3 ${isDark ? "text-white" : "text-dark"}`}
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-5"></i>
              </button>
              <h5 className="mb-0 fw-bold">
                {type === "post" ? "Gönderi" : "Yanıt"}
              </h5>
            </div>

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
              className={`p-3 border-bottom ${isDark ? "bg-dark bg-opacity-25 border-secondary border-opacity-25" : "bg-light border-light"}`}
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
          </main>
          <aside className="col-lg-5 d-none d-lg-block ps-4">
            <RightAside />
          </aside>
        </div>
      </div>
    </div>
  );
}
