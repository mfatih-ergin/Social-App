import React, { useState, useEffect } from "react";
import { createCollection } from "../../api/collection.api";
import { useTheme } from "../../context/ThemeContext";

export default function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createCollection({ name: name.trim() });
      setName("");
      onSuccess();
      onClose();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Klasör oluşturulurken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block shadow"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className={`modal-content border-0 ${isDark ? "bg-dark text-white shadow-lg" : "bg-white"}`}
        >
          <div
            className={`modal-header border-bottom ${isDark ? "border-secondary border-opacity-25" : ""}`}
          >
            <h5 className="modal-title fw-bold">Yeni Koleksiyon Oluştur</h5>
            <button
              type="button"
              className={`btn-close ${isDark ? "btn-close-white" : ""}`}
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <label className="small mb-2 fw-bold text-secondary">
                KOLEKSİYON ADI
              </label>
              <input
                type="text"
                className={`form-control border-0 p-3 ${isDark ? "bg-black text-white" : "bg-light text-dark"}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className={`modal-footer border-0`}>
              <button
                type="button"
                className="btn btn-link text-decoration-none text-secondary"
                onClick={onClose}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 rounded-pill fw-bold"
                disabled={loading || !name.trim()}
              >
                {loading ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
