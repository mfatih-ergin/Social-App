import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileContent from "../components/Profile/ProfileContent";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [activeCollection, setActiveCollection] = useState("Tümü");

  return (
    <div>
      <div className="mt-2">
        <ProfileContent
          activeTab="saved"
          id={user?._id}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />
      </div>
    </div>
  );
}
