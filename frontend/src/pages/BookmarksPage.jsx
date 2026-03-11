import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Content from "../components/Profile/Content";

export default function BookmarksPage() {
  const { user } = useAuth();
  const { collectionName } = useParams();

  const [activeCollection, setActiveCollection] = useState(
    collectionName ? decodeURIComponent(collectionName) : "Tümü",
  );

  useEffect(() => {
    if (collectionName) {
      setActiveCollection(decodeURIComponent(collectionName));
    } else {
      setActiveCollection((prev) =>
        prev === "Koleksiyonlar" ? "Koleksiyonlar" : "Tümü",
      );
    }
  }, [collectionName]);

  return (
    <div>
      <div className="mt-2">
        <Content
          activeTab="saved"
          id={user?._id}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />
      </div>
    </div>
  );
}
