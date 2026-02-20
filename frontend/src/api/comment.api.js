import axios from "axios";

const API_URL = "http://localhost:5000/api/comments";

export const addComment = async (postId, formData) => {
  const response = await axios.post(`${API_URL}/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

export const getCommentsByPostId = (postId) => {
  return axios.get(`${API_URL}/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export const likeComment = (commentId) => {
  return axios.put(
    `${API_URL}/${commentId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
};

export const deleteComment = (commentId) => {
  return axios.delete(`${API_URL}/${commentId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const getCommentById = (commentId) => {
  return axios.get(`${API_URL}/detail/${commentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export const getReplies = (commentId) => {
  return axios.get(`${API_URL}/replies/${commentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
