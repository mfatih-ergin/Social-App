import React, { useEffect, useState, useRef } from "react";
import { getCollections } from "../../../../api/collection.api";
import { useTheme } from "../../../../context/ThemeContext";
import "./SaveActionMenu.css";

export default function SaveActionMenu({
  isOpen,
  onClose,
  onFinish,
  initialSelectedFolders = [],
}) {
  const [collections, setCollections] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const foldersRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getCollections()
        .then((res) => {
          setCollections(res.data?.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      const normalized = (initialSelectedFolders || []).map((id) =>
        id ? String(id) : null,
      );
      const defaultSelection = normalized.length > 0 ? normalized : [null];
      setSelectedFolders(defaultSelection);
      foldersRef.current = defaultSelection;
    }
  }, [isOpen, initialSelectedFolders]);

  const toggleFolder = (folderId) => {
    const targetId = folderId ? String(folderId) : null;
    setSelectedFolders((prev) => {
      const exists = prev.includes(targetId);
      const newState = exists
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId];
      foldersRef.current = newState;
      return newState;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="save-menu-overlay" onClick={onClose}>
      <div
        className={`save-menu-sheet ${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="save-menu-header d-flex justify-content-between align-items-center mb-4 px-1">
          <button className="btn-action text-secondary" onClick={onClose}>
            Vazgeç
          </button>
          <h6 className="fw-bold m-0">Koleksiyonlara Ekle</h6>
          <button
            className="btn-action text-primary"
            onClick={() => onFinish(foldersRef.current)}
            disabled={loading}
          >
            Bitir
          </button>
        </div>

        <div className="save-menu-list">
          {loading ? (
            <div className="save-menu-loader-container">
              <div className="save-menu-spinner"></div>
              <p className="mt-3 text-secondary small">
                Koleksiyonlar yükleniyor...
              </p>
            </div>
          ) : (
            <>
              <div
                className={`save-menu-item ${theme}`}
                onClick={() => toggleFolder(null)}
              >
                <div className="folder-info">
                  <i className="bi bi-bookmark text-secondary fs-5"></i>
                  <span>Tümü</span>
                </div>
                {selectedFolders.includes(null) && (
                  <i className="bi bi-check-circle-fill text-primary fs-5"></i>
                )}
              </div>

              {collections.map((col) => {
                const sId = String(col._id);
                return (
                  <div
                    key={sId}
                    className={`save-menu-item ${theme}`}
                    onClick={() => toggleFolder(sId)}
                  >
                    <div className="folder-info">
                      <i className="bi bi-folder2 text-secondary fs-5"></i>
                      <span>{col.name}</span>
                    </div>
                    {selectedFolders.includes(sId) && (
                      <i className="bi bi-check-circle-fill text-primary fs-5"></i>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
