import React, { createContext, useState, useCallback } from "react";

export const LikeContext = createContext(null);

export const LikeProvider = ({ children }) => {
  const [globalLikes, setGlobalLikes] = useState({});

  const updateGlobalLike = useCallback((id, liked, count) => {
    setGlobalLikes((prev) => ({
      ...prev,
      [id]: { liked, count },
    }));
  }, []);

  const getLikeStatus = useCallback(
    (id, initialLiked, initialCount) => {
      if (globalLikes[id]) {
        return globalLikes[id];
      }
      return { liked: initialLiked, count: initialCount };
    },
    [globalLikes],
  );

  return (
    <LikeContext.Provider value={{ updateGlobalLike, getLikeStatus }}>
      {children}
    </LikeContext.Provider>
  );
};
