import api from "./axios";

export const createPost = (data) => api.post("/posts/create", data);

export const getHomePosts = () => {
  return api.get("/posts");
};

export const getExplorePosts = () => {
  return api.get("/posts/explore");
};

export const likePost = (postId) => api.put(`/posts/${postId}/like`);

export const deletePost = (postId) => api.delete(`/posts/delete/${postId}`);

/*export const getUserLikedPosts = (userId) =>
  api.get(`/posts/user/${userId}/likes`);*/

export const getLikedContent = (userId) =>
  api.get(`/posts/user/${userId}/likes`);

export const getPostById = (postId) => {
  return api.get(`/posts/${postId}`);
};

export const repostContent = (postId) => api.post(`/posts/repost/${postId}`);
