import api from "./axios";

export const toggleSaveApi = (id, type = "post") =>
  api.post(`/saves/toggle/${id}`, { type });

export const getSavedContent = () => api.get("/saves");
