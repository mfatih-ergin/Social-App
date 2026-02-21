import { useEffect, useState, useCallback } from "react";
import { getUserPosts } from "../../api/user.api";
import { getLikedContent } from "../../api/like.api";
import { getSavedContent } from "../../api/save.api";
import { getCollections } from "../../api/collection.api";
import { useTheme } from "../../context/ThemeContext";
import PostCard from "../Post/PostCard";
import CommentCard from "../Comment/CommentCard";
import ProfileSavedCollections from "./ProfileSavedCollections";

export default function ProfileContent({
  activeTab,
  id,
  activeCollection = "Tümü",
  setActiveCollection,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState(["Tümü"]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fetchCollections = useCallback(async () => {
    try {
      const res = await getCollections();
      const apiCollections = res.data?.data || [];
      const newList = ["Tümü", ...apiCollections];

      setCollections((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newList)) return prev;
        return newList;
      });
    } catch (err) {
      console.error("Klasörler yüklenemedi", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!id || id === "undefined") return;

    setLoading(true);
    try {
      let res;
      if (activeTab === "posts") {
        res = await getUserPosts(id);
      } else if (activeTab === "likes") {
        res = await getLikedContent(id);
      } else if (activeTab === "saved") {
        res = await getSavedContent(activeCollection);
      }

      const rawData = res?.data || res || [];

      if (activeTab === "saved" || activeTab === "likes") {
        const flattenedData = Array.isArray(rawData)
          ? rawData
              .map((item) => {
                if (item.isComment !== undefined) return item;
                if (item.post) return { ...item.post, isComment: false };
                if (item.comment) return { ...item.comment, isComment: true };
                return item;
              })
              .filter(Boolean)
          : [];
        setData(flattenedData);
      } else {
        setData(Array.isArray(rawData) ? rawData : []);
      }
    } catch (err) {
      console.error("Content yükleme hatası:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [id, activeTab, activeCollection]);

  useEffect(() => {
    if (activeTab === "saved") {
      fetchCollections();
    }
  }, [activeTab, fetchCollections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="d-flex flex-column">
      {activeTab === "saved" && (
        <ProfileSavedCollections
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
          collections={collections}
          onRefresh={fetchCollections}
        />
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      ) : data.length > 0 ? (
        data.map((item) => {
          const uniqueKey = item._id || Math.random();
          if (item.isComment || item.comment) {
            return (
              <CommentCard
                key={`comment-${uniqueKey}`}
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
          return (
            <PostCard
              key={`post-${uniqueKey}`}
              post={item}
              onUpdate={loadData}
            />
          );
        })
      ) : (
        <div
          className={`text-center py-5 ${isDark ? "text-secondary" : "text-muted"}`}
        >
          <i
            className={`bi ${activeTab === "posts" ? "bi-chat-square-text" : activeTab === "likes" ? "bi-heart-break" : "bi-folder2-open"} fs-1`}
          ></i>
          <p className="mt-2">
            {activeTab === "saved"
              ? activeCollection === "Tümü"
                ? "Henüz bir içerik kaydetmediniz."
                : `"${activeCollection}" klasörü henüz boş.`
              : "Henüz içerik bulunamadı."}
          </p>
        </div>
      )}
    </div>
  );
}
