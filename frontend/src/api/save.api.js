import api from "./axios";

export const toggleSaveApi = (id, type = "post", collectionIds = []) =>
  api.post(`/saves/toggle/${id}`, { type, collectionIds });

export const getSavedContent = (collectionName = "Tümü") => {
  const query = collectionName
    ? `collectionName=${encodeURIComponent(collectionName)}`
    : "";
  return api.get(`/saves?${query}&t=${new Date().getTime()}`);
};
