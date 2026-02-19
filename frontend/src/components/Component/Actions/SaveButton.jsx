import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { toggleSaveApi } from "../../../api/save.api";
import "../../../styles/SaveButton.css";

export default function SaveButton({
  contentId,
  isSavedInitial = false,
  type = "post",
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    if (e) e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setIsSaved(!isSaved);

      const res = await toggleSaveApi(contentId, type);

      if (res.data.saved !== !isSaved) {
        setIsSaved(res.data.saved);
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setIsSaved(isSaved);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`save-btn btn d-flex align-items-center border-0 bg-transparent p-0 shadow-none 
        ${isSaved ? "saved" : ""} 
        ${isDark ? "dark-theme" : ""} 
        ${loading ? "disabled" : ""}`}
      title={isSaved ? "Kaydedilenlerden kaldır" : "Kaydet"}
    >
      <i
        className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"} fs-5`}
      ></i>
    </button>
  );
}
