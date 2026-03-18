import { useState } from "react";
import { followUser, unfollowUser } from "../../api/user.api";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

export default function FollowButton({ targetUserId, initialIsFollowing }) {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const isDark = theme === "dark";

  if (currentUser?._id === targetUserId) return null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Takip işlemi başarısız:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn rounded-pill fw-bold px-3 py-1 ${
        isFollowing ? "btn-outline-danger" : isDark ? "btn-light" : "btn-dark"
      }`}
      style={{ fontSize: "14px", minWidth: "110px" }}
    >
      {loading ? "..." : isFollowing ? "Takipten Çık" : "Takip Et"}
    </button>
  );
}
