import { useEffect, useState } from "react";
import { getHomePosts } from "../api/post.api";
import { useAuth } from "../hooks/useAuth";
import HomePostList from "../components/Post/HomePostList";
import PostForm from "../components/Post/PostForm";
import Loading from "../components/Loading";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getHomePosts();
      setPosts(res.data);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="alert alert-warning text-center shadow-sm m-4">
        👋 İçerikleri görmek için lütfen{" "}
        <a href="/login" className="alert-link">
          giriş yapınız
        </a>
        .
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="pt-5">
          <Loading message="Ana Sayfa Yükleniyor..." />
        </div>
      ) : (
        <div className="d-flex flex-column">
          <PostForm onPostCreated={fetchPosts} />

          <HomePostList posts={posts} fetchPosts={fetchPosts} />
        </div>
      )}
    </div>
  );
}
