import { useLike } from "../context/LikeContext";

export const useGlobalLike = () => {
  const context = useLike();
  if (!context) {
    throw new Error("useGlobalLike must be used within a LikeProvider");
  }
  return context;
};
