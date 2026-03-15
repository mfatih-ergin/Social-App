import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../hooks/useAuth";
import { toggleSaveApi } from "../../../../api/save.api";
import SaveActionMenu from "./SaveActionMenu";
import "./SaveButton.css";

export default function SaveButton({
  contentId,
  isSavedInitial = false,
  type = "post",
  initialCollectionIds = [],
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [currentCollectionIds, setCurrentCollectionIds] =
    useState(initialCollectionIds);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsSaved(isSavedInitial);
    setCurrentCollectionIds(initialCollectionIds || []);
  }, [isSavedInitial, initialCollectionIds]);

  const handleIconClick = (e) => {
    if (e) e.stopPropagation();
    if (!user) return navigate("/login");
    if (loading) return;

    setIsMenuOpen(true);
  };

  const handleSaveFinish = async (selectedIds) => {
    try {
      setLoading(true);

      const res = await toggleSaveApi(contentId, type, selectedIds);

      const savedStatus = res.data.saved;
      setIsSaved(savedStatus);

      setCurrentCollectionIds(savedStatus ? selectedIds : []);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <>
      <button
        onClick={handleIconClick}
        disabled={loading}
        className={`save-btn btn d-flex align-items-center border-0 bg-transparent p-0 shadow-none 
          ${isSaved ? "saved" : ""} 
          ${isDark ? "dark-theme" : ""} 
          ${loading ? "disabled" : ""}`}
      >
        <div className="save-icon-wrapper">
          <i
            className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"} fs-5`}
          ></i>
        </div>
      </button>

      <SaveActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onFinish={handleSaveFinish}
        initialSelectedFolders={currentCollectionIds}
      />
    </>
  );
}
