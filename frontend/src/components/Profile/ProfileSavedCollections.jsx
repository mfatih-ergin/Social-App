import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import CollectionButton from "../Component/CollectionButton";
import CreateCollectionModal from "../Component/CreateCollectionModal";
import { deleteCollection } from "../../api/collection.api";

export default function ProfileSavedCollections({
  activeCollection,
  setActiveCollection,
  collections,
  onRefresh,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleDelete = async (colId, e) => {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        "Bu klasörü ve içindekileri silmek istediğine emin misin?",
      )
    )
      return;

    try {
      await deleteCollection(colId);
      if (activeCollection === collections.find((c) => c._id === colId)?.name) {
        setActiveCollection("Tümü");
      }
      onRefresh();
    } catch (err) {
      alert("Klasör silinirken bir hata oluştu.");
    }
  };

  return (
    <div
      className={`border-bottom ${isDark ? "border-secondary border-opacity-25" : "border-light"}`}
    >
      <div
        className="d-flex align-items-center gap-2 overflow-auto p-3 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {collections.map((col) => {
          const colName = col.name || col;
          const isDefault = colName === "Tümü";

          return (
            <CollectionButton
              key={col._id || col}
              label={colName}
              isActive={activeCollection === colName}
              onClick={() => setActiveCollection(colName)}
              onDelete={!isDefault ? (e) => handleDelete(col._id, e) : null}
            />
          );
        })}

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
