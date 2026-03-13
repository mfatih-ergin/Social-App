import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { getAllSuggestions, followUser } from "../api/user.api";
import Avatar from "../components/Component/Avatar";
import "../styles/ConnectPeople.css";

export default function ConnectPeople() {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllSuggestions();
        setUsers(res.data);
      } catch (err) {
        console.error("Kullanıcılar yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    } else {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleFollow = async (userId) => {
    if (followLoading[userId]) return;

    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      await followUser(userId);

      setUsers((prev) => prev.filter((u) => u._id !== userId));

      window.dispatchEvent(
        new CustomEvent("userFollowed", {
          detail: { userId, isFollowing: true },
        }),
      );
    } catch (err) {
      alert("Takip işlemi başarısız.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className={`connect-container ${isDark ? "connect-dark" : ""}`}>
      <div className="connect-content">
        <div className="px-3 py-3 border-bottom">
          <h4 className="fw-bold mb-0" style={{ fontSize: "20px" }}>
            Takip etmen için önerilenler
          </h4>
        </div>

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="user-list">
            {users.map((user) => (
              <div
                key={user._id}
                className={`user-item d-flex align-items-center justify-content-between p-3 border-bottom ${
                  isDark ? "user-item-dark" : "user-item-light"
                }`}
              >
                <div
                  className="d-flex align-items-center flex-grow-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <div className="me-3">
                    <Avatar
                      userId={user._id}
                      profileImage={user.profileImage}
                      size="48px"
                      userData={user}
                    />
                  </div>

                  <div className="d-flex flex-column overflow-hidden">
                    <span
                      className={`fw-bold text-truncate ${isDark ? "text-white" : "text-dark"}`}
                    >
                      {user.displayName || user.username}
                    </span>
                    {user.bio && (
                      <p
                        className={`mb-0 mt-1 small text-truncate ${isDark ? "text-secondary" : "text-muted"}`}
                      >
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user._id)}
                  className={`btn follow-btn-main rounded-pill fw-bold px-4 ${isDark ? "btn-light" : "btn-dark"}`}
                  disabled={followLoading[user._id]}
                >
                  {followLoading[user._id] ? "..." : "Takip et"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center text-muted">
            <p>Şu an için yeni bir öneri bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
