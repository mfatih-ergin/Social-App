import { useEffect, useState } from "react";
import { getUserPosts } from "../../api/user.api";
import { getLikedContent } from "../../api/post.api";
import { getSavedContent } from "../../api/save.api";
import { useTheme } from "../../context/ThemeContext";
import PostCard from "../Post/PostCard";
import CommentCard from "../Comment/CommentCard";
import ProfileSavedCollections from "./ProfileSavedCollections";

export default function ProfileContent({
  activeTab,
  id,
  activeCollection,
  setActiveCollection,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const collections = ["Tümü", "Manzaralar", "Yazılım", "Komik"];
  const isDark = theme === "dark";

  const loadData = async () => {
    if (!id || id === "undefined") return;

    setLoading(true);
    try {
      let res;
      if (activeTab === "posts") {
        res = await getUserPosts(id);
      } else if (activeTab === "likes") {
        res = await getLikedContent(id);
      } else if (activeTab === "saved") {
        res = await getSavedContent();
      }

      if (activeTab === "saved") {
        const flattenedData = (res.data || [])
          .map((item) => {
            if (item.post) return { ...item.post, isComment: false };
            if (item.comment) return { ...item.comment, isComment: true };
            return null;
          })
          .filter(Boolean);
        setData(flattenedData);
      } else {
        setData(res.data || []);
      }
    } catch (err) {
      console.error("Content yükleme hatası:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, activeTab]);

  return (
    <div className="d-flex flex-column gap-3">
      {activeTab === "saved" && (
        <ProfileSavedCollections
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
          collections={collections}
        />
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      ) : data.length > 0 ? (
        data.map((item) => {
          if (item.isComment || item.comment) {
            return (
              <CommentCard
                key={item._id}
                comment={{
                  ...item,
                  userId: item.userId || item.user?._id,
                  username: item.username || item.user?.username,
                  profileImage: item.profileImage || item.user?.profileImage,
                }}
                onUpdate={loadData}
              />
            );
          }
          return <PostCard key={item._id} post={item} onUpdate={loadData} />;
        })
      ) : (
        <div
          className={`text-center py-5 ${isDark ? "text-secondary" : "text-muted"}`}
        >
          <i
            className={`bi ${
              activeTab === "posts"
                ? "bi-chat-square-text"
                : activeTab === "likes"
                  ? "bi-heart-break"
                  : "bi-folder2-open"
            } fs-1`}
          ></i>
          <p className="mt-2">
            {activeTab === "saved"
              ? `"${activeCollection}" klasörü henüz boş.`
              : "Henüz içerik bulunamadı."}
          </p>
        </div>
      )}
    </div>
  );
}
