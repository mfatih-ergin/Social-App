import PostCard from "../Post/PostCard";
import { useTheme } from "../../context/ThemeContext";

export default function HomePostList({ posts, fetchPosts }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="d-flex flex-column">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))
      ) : (
        <div
          className={`text-center py-5 ${isDark ? "text-secondary" : "text-muted"}`}
        >
          <p className="mb-0">
            Henüz hiç gönderi yok.
            <br />
            Gönderi paylaşabilir ya da kullanıcıları takip edebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
