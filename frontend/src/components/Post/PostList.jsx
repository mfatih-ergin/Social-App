import { useEffect, useState } from "react";
import { getPosts } from "../../api/post.api";
import PostCard from "./PostCard";

export default function PostList() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await getPosts();
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {posts
        .filter((p) => p && p.user)
        .map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
    </div>
  );
}
