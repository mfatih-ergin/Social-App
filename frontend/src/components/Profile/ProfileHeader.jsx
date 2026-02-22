import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import EditProfileModal from "./EditProfileModal";

export default function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  handleFollowToggle,
  btnLoading,
  onUpdate,
}) {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDark = theme === "dark";

  const defaultAvatar = import.meta.env.VITE_DEFAULT_AVATAR_URL;
  const defaultBanner = import.meta.env.VITE_DEFAULT_BANNER_URL;

  return (
    <>
      <div
        style={{
          height: "250px",
          backgroundImage: `url(${profile.banner || defaultBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: isDark ? "1px solid #333" : "1px solid #dee2e6",
          backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
        }}
      ></div>

      <div className="px-4" style={{ position: "relative" }}>
        <div className="d-flex justify-content-between align-items-end">
          <div style={{ marginTop: "-75px" }}>
            <img
              src={profile.profileImage || defaultAvatar}
              alt={profile.username}
              className={`rounded-circle border border-4 shadow-sm ${
                isDark ? "border-black" : "border-white"
              }`}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                backgroundColor: isDark ? "#000" : "#fff",
              }}
            />
          </div>

          <div className="mb-3">
            {isOwnProfile ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className={`btn rounded-pill fw-bold ${
                  isDark ? "btn-outline-light" : "btn-outline-dark"
                }`}
              >
                Profili Düzenle
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={btnLoading}
                className={`btn rounded-pill fw-bold px-4 ${
                  isFollowing
                    ? "btn-outline-danger"
                    : isDark
                      ? "btn-light"
                      : "btn-dark"
                }`}
              >
                {btnLoading ? "..." : isFollowing ? "Takipten Çık" : "Takip Et"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className={`fw-bold mb-0 ${isDark ? "text-white" : "text-dark"}`}>
            {profile.username}
          </h2>
          <p className={`mt-3 mb-3 ${isDark ? "text-light" : "text-dark"}`}>
            {profile.bio || "Merhaba! Ben Social App kullanıyorum."}
          </p>

          <div className="d-flex gap-4 mb-4">
            <span className={isDark ? "text-light" : "text-dark"}>
              <span className="fw-bold">{profile.following?.length || 0}</span>{" "}
              <span className="text-secondary">Takip Edilen</span>
            </span>
            <span className={isDark ? "text-light" : "text-dark"}>
              <span className="fw-bold">{profile.followers?.length || 0}</span>{" "}
              <span className="text-secondary">Takipçi</span>
            </span>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
