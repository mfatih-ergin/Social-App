import api from "./axios";

export const addComment = async (postId, formData) => {
  const response = await api.post(`/comments/${postId}`, formData);
  return response.data;
};

export const getCommentsByPostId = (postId) => {
  return api.get(`/comments/${postId}`);
};

export const likeComment = (commentId) => {
  return api.put(`/comments/${commentId}/like`);
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};

export const getCommentById = (commentId) => {
  return api.get(`/comments/detail/${commentId}`);
};

export const getReplies = (commentId) => {
  return api.get(`/comments/replies/${commentId}`);
};
