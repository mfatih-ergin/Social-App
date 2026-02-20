import { useContext } from "react";
import { LikeContext } from "../context/LikeContext";

export const useGlobalLike = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error("useGlobalLike must be used within a LikeProvider");
  }
  return context;
};
