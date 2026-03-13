import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "./Avatar";
import api from "../../api/axios";
import "../../styles/UserCard.css";

export default function UserCard({ userId, initialData }) {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const cardRef = useRef(null);
  const [offsetStyle, setOffsetStyle] = useState({});

  const displayUsername =
    initialData?.username || initialData?.user?.username || "Kullanıcı";
  const displayProfileImage =
    initialData?.profileImage || initialData?.user?.profileImage;

  const [stats, setStats] = useState({
    bio: initialData?.bio || initialData?.user?.bio || "",
    followersCount: 0,
    followingCount: 0,
    isFollowingByMe: initialData?.isFollowingByMe || false,
  });
  const [loading, setLoading] = useState(true);

  const isMe = currentUser?._id === userId;

  useEffect(() => {
    const handleGlobalFollow = (event) => {
      if (event.detail.userId === userId) {
        setStats((prev) => ({
          ...prev,
          isFollowingByMe: event.detail.isFollowing,
          followersCount: event.detail.isFollowing
            ? prev.followersCount + 1
            : Math.max(0, prev.followersCount - 1),
        }));
      }
    };
    window.addEventListener("userFollowed", handleGlobalFollow);
    return () => window.removeEventListener("userFollowed", handleGlobalFollow);
  }, [userId]);

  useLayoutEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      let style = {};

      if (rect.right > windowWidth)
        style.transform = `translateX(-${rect.right - windowWidth + 20}px)`;
      if (rect.left < 0)
        style.transform = `translateX(${Math.abs(rect.left) + 20}px)`;

      setOffsetStyle(style);
    }
  }, []);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}`);
        setStats({
          bio: res.data.bio || "",
          followersCount: res.data.followersCount || 0,
          followingCount: res.data.followingCount || 0,
          isFollowingByMe: res.data.isFollowingByMe || false,
        });
      } catch (err) {
        console.error("Detay hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUserDetail();
  }, [userId]);

  const handleFollowClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.put(`/users/${userId}/follow`);
      const newStatus = !stats.isFollowingByMe;

      window.dispatchEvent(
        new CustomEvent("userFollowed", {
          detail: { userId, isFollowing: newStatus },
        }),
      );
    } catch (error) {
      console.error("Takip hatası:", error);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`user-card-popover shadow-lg p-3 border rounded text-start ${theme === "dark" ? "dark" : ""}`}
      style={{
        position: "relative",
        zIndex: 10000,
        pointerEvents: "auto",
        ...offsetStyle,
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Avatar
          userId={userId}
          profileImage={displayProfileImage}
          size="60px"
        />
        {!isMe && currentUser && (
          <button
            onClick={handleFollowClick}
            className={`btn btn-sm ${stats.isFollowingByMe ? "btn-outline-primary" : "btn-primary"} rounded-pill fw-bold`}
          >
            {stats.isFollowingByMe ? "Takibi Bırak" : "Takip Et"}
          </button>
        )}
      </div>
      <div
        className={`fw-bold fs-5 mt-1 ${theme === "dark" ? "text-white" : "text-dark"}`}
      >
        {displayUsername}
      </div>
      {/* <div className="text-secondary small mb-2">
        @{displayUsername.replace(/\s+/g, "").toLowerCase()}
      </div> */}
      <div className="user-bio small mb-2" style={{ minHeight: "20px" }}>
        {loading ? (
          <span className="text-muted small">Yükleniyor...</span>
        ) : (
          stats.bio || "Biyografi yok."
        )}
      </div>
      <div className="d-flex gap-3 small mt-2 pt-2 stats-divider">
        <div>
          <span className="fw-bold">
            {loading ? "..." : stats.followersCount}
          </span>{" "}
          <span className="text-secondary">Takipçi</span>
        </div>
        <div>
          <span className="fw-bold">
            {loading ? "..." : stats.followingCount}
          </span>{" "}
          <span className="text-secondary">Takip edilen</span>
        </div>
      </div>
    </div>
  );
}
