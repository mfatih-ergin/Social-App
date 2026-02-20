import api from "./axios";

export const toggleLike = (ids) => {
  return api.post("/likes/like", ids);
};

export const getLikedContent = (userId) => {
  return api.get(`/likes/user/${userId}`);
};
