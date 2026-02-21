import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ProfileContent from "../components/Profile/ProfileContent";
import RightAside from "../components/Layout/RightAside";

export default function BookmarksPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [activeCollection, setActiveCollection] = useState("Tümü");

  useEffect(() => {
    document.title = "Kaydedilenler / Social App";
  }, []);

  return (
    <div
      className={`container-fluid p-0 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
    >
      <div className="row justify-content-center g-0">
        <div
          className={`col-12 col-md-8 col-lg-6 border-start border-end min-vh-100 ${
            isDark ? "border-secondary border-opacity-25" : "border-light"
          }`}
        >
          <div
            className="p-3 sticky-top"
            style={{
              backdropFilter: "blur(12px)",
              zIndex: 10,
              backgroundColor: isDark
                ? "rgba(0,0,0,0.65)"
                : "rgba(255,255,255,0.85)",
            }}
          >
            <h5 className="fw-bold m-0">Kaydedilenler</h5>
          </div>

          <div className="mt-2">
            <ProfileContent
              activeTab="saved"
              id={user?._id}
              activeCollection={activeCollection}
              setActiveCollection={setActiveCollection}
            />
          </div>
        </div>

        <div className="col-lg-4 d-none d-lg-block ps-3">
          <div className="sticky-top pt-2">
            <RightAside />
          </div>
        </div>
      </div>
    </div>
  );
}
