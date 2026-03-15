import { useEffect, useState } from "react";
import { getExplorePosts } from "../../api/post.api";
import { useTheme } from "../../context/ThemeContext";
import PostCard from "../Post/PostCard";
import Loading from "../Component/Loading";

export default function ExplorePostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await getExplorePosts();
      setPosts(res.data);
    } catch (error) {
      console.error("Explore postları yüklenemedi", error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loading message="Keşfet Yükleniyor..." />;
  }

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))
      ) : (
        <div
          className={`text-center py-5 ${theme === "dark" ? "text-secondary" : "text-muted"}`}
        >
          Keşfedilecek bir şey bulunamadı.
        </div>
      )}
    </div>
  );
}
