import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, followUser, unfollowUser } from "../api/user.api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileTabs from "../components/Profile/ProfileTabs";
import ProfileContent from "../components/Profile/ProfileContent";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [activeCollection, setActiveCollection] = useState("Tümü");

  const isDark = theme === "dark";
  const isOwnProfile =
    currentUser && (currentUser._id === id || currentUser.id === id);

  useEffect(() => {
    if (profile?.username) {
      document.title = `${profile.username} / ${import.meta.env.VITE_APP_NAME}`;
    } else {
      document.title = `Profil / ${import.meta.env.VITE_APP_NAME}`;
    }
  }, [profile]);

  const fetchProfile = async (silent = false) => {
    if (!id || id === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    try {
      if (!silent) setLoading(true);

      const res = await getUserProfile(id);
      setProfile(res.data);
      setError(null);
    } catch (err) {
      //console.error("Profil çekme hatası:", err);

      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Token")
      ) {
        navigate("/login", { state: { from: location }, replace: true });
        return;
      }

      if (!silent)
        setError(err.response?.data?.message || "Kullanıcı bulunamadı.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== "undefined") {
      fetchProfile();
      setActiveTab("posts");
    }
  }, [id]);

  const handleFollowToggle = async () => {
    if (btnLoading || !currentUser || !profile) return;
    try {
      setBtnLoading(true);

      profile.isFollowingByMe
        ? await unfollowUser(profile._id)
        : await followUser(profile._id);

      const res = await getUserProfile(id);
      setProfile(res.data);
    } catch (err) {
      alert("İşlem başarısız.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-5 text-center">
        <div className="spinner-border"></div>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="profile-page-wrapper">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={profile?.isFollowingByMe}
        handleFollowToggle={handleFollowToggle}
        btnLoading={btnLoading}
        onUpdate={() => fetchProfile(true)}
      />

      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOwnProfile={isOwnProfile}
      />

      <div className="px-0 py-0">
        <ProfileContent
          activeTab={activeTab}
          id={id}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />
      </div>
    </div>
  );
}
