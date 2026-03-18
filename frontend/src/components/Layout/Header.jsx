import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import CreateCollectionButton from "../Component/CreateCollectionButton";
import CollectionOptionsButton from "../Component/CollectionOptionsButton";
import { getCollections, deleteCollection } from "../../api/collection.api";

export default function Header() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { collectionName } = useParams();
  const isDark = theme === "dark";
  const [currentCollectionId, setCurrentCollectionId] = useState(null);

  const path = location.pathname;
  const isBookmarksPath = path.includes("/bookmarks");
  const isCollectionDetail = isBookmarksPath && collectionName;

  useEffect(() => {
    if (isCollectionDetail) {
      const fetchId = async () => {
        try {
          const res = await getCollections();
          const collections = res.data?.data || [];
          const found = collections.find(
            (c) => c.name === decodeURIComponent(collectionName),
          );
          if (found) setCurrentCollectionId(found._id);
        } catch (err) {
          console.error("ID bulunamadı", err);
        }
      };
      fetchId();
    }
  }, [isCollectionDetail, collectionName]);

  const handleDelete = async () => {
    if (!currentCollectionId) return;

    const confirmDelete = window.confirm(
      "Bu koleksiyonu silmek istediğine emin misin?",
    );
    if (confirmDelete) {
      try {
        await deleteCollection(currentCollectionId);
        navigate("/bookmarks", { replace: true });
      } catch (err) {
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  const getHeaderInfo = () => {
    if (path.includes("/home")) return { title: "Ana Sayfa", showBack: false };
    if (path.includes("/explore")) return { title: "Keşfet", showBack: false };
    if (path.includes("/post") || path.includes("/comment"))
      return { title: "Gönderi", showBack: true };

    if (isBookmarksPath) {
      return {
        title: isCollectionDetail
          ? decodeURIComponent(collectionName)
          : "Yer İşaretleri",
        showBack: true,
      };
    }
    return { title: "Detaylar", showBack: true };
  };

  const { title, showBack } = getHeaderInfo();

  return (
    <div
      className={`d-flex align-items-center justify-content-between px-3 sticky-top ${
        isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        zIndex: 1050,
        height: "75px",
        borderBottom: isDark ? "1px solid #2f3336" : "1px solid #eff3f4",
        width: "calc(100% - 2px)",
        marginLeft: "1px",
        marginRight: "1px",
      }}
    >
      <div className="d-flex align-items-center">
        {showBack && (
          <button
            className={`btn border-0 p-0 me-3 ${isDark ? "text-white" : "text-dark"}`}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
        )}
        <h5 className="mb-0 fw-bold fs-5">{title}</h5>
      </div>

      {isBookmarksPath && (
        <div className="d-flex align-items-center">
          {isCollectionDetail ? (
            <CollectionOptionsButton onDelete={handleDelete} />
          ) : (
            <CreateCollectionButton />
          )}
        </div>
      )}
    </div>
  );
}
