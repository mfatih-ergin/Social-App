import api from "./axios";

export const getCollections = () => {
  return api.get(`/collections?t=${new Date().getTime()}`);
};

export const createCollection = (name) => {
  return api.post("/collections", { name });
};

export const deleteCollection = (collectionId) => {
  return api.delete(`/collections/${collectionId}`);
};
