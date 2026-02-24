import api from "./axios";

export const createPost = (data) => api.post("/posts/create", data);

export const updatePost = (postId, data) => api.put(`/posts/${postId}`, data);

export const getHomePosts = () => {
  return api.get("/posts");
};

export const getExplorePosts = () => {
  return api.get("/posts/explore");
};

export const deletePost = (postId) => api.delete(`/posts/delete/${postId}`);

export const getPostById = (postId) => {
  return api.get(`/posts/${postId}`);
};

export const repostContent = (postId, data) =>
  api.post(`/posts/repost/${postId}`, data);
