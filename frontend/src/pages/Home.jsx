import { useEffect, useState } from "react";
import { getHomePosts } from "../api/post.api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import HomePostList from "../components/Post/HomePostList";
import PostForm from "../components/Post/PostForm";
import HomeHeader from "../components/Home/HomeHeader";
import Loading from "../components/Loading";
import RightAside from "../components/Layout/RightAside";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  useEffect(() => {
    document.title = `Ana Sayfa / ${import.meta.env.VITE_APP_NAME}`;
  }, []);

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
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
      style={{ transition: "background-color 0.3s ease" }}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div
            className={`col-12 col-md-8 col-lg-6 border-start border-end min-vh-100 p-0 ${isDark ? "border-secondary" : "border-light"}`}
          >
            <HomeHeader />

            {isLoading ? (
              <div className="pt-5">
                <Loading message="Ana Sayfa Yükleniyor..." />
              </div>
            ) : (
              <div>
                <div>
                  <PostForm onPostCreated={fetchPosts} />
                </div>

                <HomePostList posts={posts} fetchPosts={fetchPosts} />
              </div>
            )}
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <RightAside />
          </div>
        </div>
      </div>
    </div>
  );
}
