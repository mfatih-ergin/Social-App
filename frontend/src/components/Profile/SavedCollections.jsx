import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import CollectionButton from "../Component/CollectionButton";

export default function SavedCollections({
  activeCollection,
  setActiveCollection,
  onRefresh,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`border-bottom ${isDark ? "border-secondary border-opacity-25" : "border-light"}`}
    >
      <div
        className="d-flex align-items-center gap-3 p-3 no-scrollbar overflow-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <CollectionButton
          label="Tümü"
          isActive={activeCollection === "Tümü"}
          onClick={() => setActiveCollection("Tümü")}
        />

        <CollectionButton
          label="Koleksiyonlar"
          isActive={activeCollection === "Koleksiyonlar"}
          icon="bi-grid"
          onClick={() => setActiveCollection("Koleksiyonlar")}
        />
      </div>
    </div>
  );
}
