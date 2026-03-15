import React, { useState } from "react";
import ReactDOM from "react-dom";
import CreateCollectionModal from "./CreateCollectionModal";
import { useTheme } from "../../context/ThemeContext";
import "./CreateCollectionButton.css";

export default function CreateCollectionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <button
        type="button"
        className={`create-coll-icon-btn ${isDark ? "dark" : "light"}`}
        onClick={() => setIsModalOpen(true)}
      >
        <i className="bi bi-plus-lg fs-5"></i>
      </button>

      {isModalOpen &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              pointerEvents: "auto",
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <CreateCollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
