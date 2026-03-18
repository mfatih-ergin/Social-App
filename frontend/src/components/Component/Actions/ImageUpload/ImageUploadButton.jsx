import { useRef } from "react";
import { useTheme } from "../../../../hooks/useTheme";
import "./ImageUploadButton.css";

export default function ImageUploadButton({ onImageSelect }) {
  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageSelect(file);
      e.target.value = null;
    }
  };

  return (
    <div className="image-upload-wrapper">
      <button
        type="button"
        className={`btn image-upload-btn shadow-none 
          ${theme === "dark" ? "hover-dark" : "hover-light"}`}
        onClick={() => fileInputRef.current.click()}
        title="Medya ekle"
      >
        <i className="bi bi-image"></i>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
