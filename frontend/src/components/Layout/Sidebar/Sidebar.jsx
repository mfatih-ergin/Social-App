import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

import SidebarLogo from "./SidebarLogo";
import SidebarItem from "./SidebarItem";
import SidebarPostButton from "./SidebarPostButton";
import SidebarProfile from "./SidebarProfile";
import PostModal from "../../Post/PostModal";

import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div
      className={`sidebar-container ${isDark ? "dark-theme" : "light-theme"} d-flex flex-column h-100`}
    >
      <div className="flex-grow-1">
        <SidebarLogo />

        <hr className="mx-2 opacity-25" />

        <ul className="nav nav-pills flex-column gap-1">
          <SidebarItem
            to="/home"
            label="Ana Sayfa"
            icon="bi-house"
            activeIcon="bi-house-fill"
          />

          <SidebarItem
            to="/explore"
            label="Keşfet"
            icon="bi-search"
            activeIcon="bi-search"
          />

          <SidebarItem
            to="/bookmarks"
            label="Yer İşaretleri"
            icon="bi-bookmark"
            activeIcon="bi-bookmark-fill"
            isAuthRequired={true}
            user={user}
          />

          <SidebarItem
            to={`/profile/${user?._id || user?.id}`}
            label="Profil"
            icon="bi-person"
            activeIcon="bi-person-fill"
            isAuthRequired={true}
            user={user}
          />

          <SidebarItem
            to="/connect_people"
            label="Takip Et"
            icon="bi-person-plus"
            activeIcon="bi-person-plus-fill"
            isAuthRequired={true}
            user={user}
          />

          <SidebarPostButton
            user={user}
            onClick={() => setIsPostModalOpen(true)}
          />
        </ul>
      </div>

      <div className="mt-auto">
        <hr className="mx-2 opacity-25" />
        <SidebarProfile user={user} isDark={isDark} />
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={() => {
          // Sayfayı yenilemek yerine onUpdate prop'u ile veriyi çekmek daha akıcı olur
          // ama şimdilik mevcut mantığını koruyorum
          window.location.reload();
        }}
      />
    </div>
  );
}
