import api from "./axios";

export const getUserProfile = (userId) => api.get(`/users/${userId}`);

export const updateProfile = (formData) =>
  api.put("/users/settings/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const followUser = (id) => api.put(`/users/${id}/follow`);

export const unfollowUser = (id) => api.put(`/users/${id}/unfollow`);

export const getUserPosts = (userId) => api.get(`/users/${userId}/userposts`);

export const updateUserSettings = (theme) =>
  api.put("/users/settings", { theme });

export const deleteUserAccount = (userId) =>
  api.delete(`/users/${userId}/delete`);
