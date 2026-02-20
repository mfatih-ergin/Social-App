import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useGlobalLike } from "../../../hooks/useGlobalLike";
import { toggleLike } from "../../../api/like.api";

import "../../../styles/LikeButton.css";

export default function Like({
  id,
  likedByCurrentUser,
  likesCount,
  isComment = false,
}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { updateGlobalLike, getLikeStatus } = useGlobalLike();

  const initialStatus = getLikeStatus(id, likedByCurrentUser, likesCount);

  const [isLiked, setIsLiked] = useState(initialStatus.liked);
  const [likeCount, setLikeCount] = useState(initialStatus.count || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentStatus = getLikeStatus(id, likedByCurrentUser, likesCount);
    setIsLiked(currentStatus.liked);
    setLikeCount(currentStatus.count || 0);
  }, [id, likedByCurrentUser, likesCount, getLikeStatus]);

  const handleLikeClick = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const prevLiked = isLiked;
    const prevCount = likeCount;
    const newLiked = !prevLiked;
    const newCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;

    setIsLiked(newLiked);
    setLikeCount(newCount);

    updateGlobalLike(id, newLiked, newCount);

    try {
      const payload = isComment ? { commentId: id } : { postId: id };
      const res = await toggleLike(payload);

      const finalLiked = res.data.liked;
      const finalCount = res.data.likesCount;

      setIsLiked(finalLiked);
      setLikeCount(finalCount);
      updateGlobalLike(id, finalLiked, finalCount);
    } catch (error) {
      console.error("Beğeni hatası:", error);
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      updateGlobalLike(id, prevLiked, prevCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleLikeClick}
      className={`btn d-flex align-items-center gap-2 border-0 bg-transparent p-0 shadow-none like-btn
        ${isLiked ? "liked" : ""}
        ${theme === "dark" ? "dark-theme" : ""} 
        ${isLoading ? "disabled" : ""}`}
    >
      <div className="like-icon-wrapper">
        {isLiked ? (
          <i className="bi bi-hand-thumbs-up-fill fs-4 fill-icon"></i>
        ) : (
          <i className="bi bi-hand-thumbs-up fs-4 outline-icon"></i>
        )}
      </div>

      <span className="fw-bold user-select-none like-count">
        {likeCount > 0 ? likeCount : 0}
      </span>
    </button>
  );
}
