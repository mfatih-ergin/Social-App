import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import CollectionButton from "../Component/CollectionButton";
import CreateCollectionModal from "../Component/CreateCollectionModal";

export default function ProfileSavedCollections({
  activeCollection,
  setActiveCollection,
  collections,
  onRefresh,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`border-bottom ${isDark ? "border-secondary border-opacity-25" : "border-light"}`}
    >
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .hover-dark:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
          .hover-light:hover { background-color: rgba(0, 0, 0, 0.05) !important; }
        `}
      </style>

      <div
        className="d-flex align-items-center gap-2 overflow-auto p-3 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {collections.map((col) => (
          <CollectionButton
            key={col._id || col}
            label={col.name || col}
            isActive={activeCollection === (col.name || col)}
            onClick={() => setActiveCollection(col.name || col)}
          />
        ))}

        <CollectionButton
          label="Yeni Klasör"
          isSpecial={true}
          icon="bi-plus-lg"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
