import PostCard from "./PostCard";
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
          className={`text-center py-5 rounded border ${
            isDark
              ? "text-secondary bg-dark border-secondary opacity-50"
              : "text-muted bg-light"
          }`}
        >
          <p className="mb-0">Henüz hiç gönderi yok.</p>
        </div>
      )}
    </div>
  );
}
