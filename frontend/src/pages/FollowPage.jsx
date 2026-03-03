import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import FollowList from "../components/Profile/FollowList";

export default function FollowPage() {
  const { userId, type } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleTabChange = (newType) => {
    if (newType !== type) {
      navigate(`/profile/${userId}/${newType}`, { replace: true });
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div
        className={`d-flex border-bottom ${isDark ? "border-secondary border-opacity-25" : "border-light"}`}
        style={{
          position: "sticky",
          backdropFilter: "blur(10px)",
          top: "75px",
          zIndex: 1040,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.75)"
            : "rgba(255, 255, 255, 0.85)",
        }}
      >
        <div
          className="flex-grow-1 text-center py-3 position-relative"
          onClick={() => handleTabChange("followers")}
          style={{ cursor: "pointer" }}
        >
          <span
            className={`fw-bold ${type === "followers" ? (isDark ? "text-white" : "text-dark") : "text-secondary"}`}
          >
            Takipçiler
          </span>
          {type === "followers" && (
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x bg-primary"
              style={{ height: "4px", width: "56px", borderRadius: "2px" }}
            />
          )}
        </div>

        <div
          className="flex-grow-1 text-center py-3 position-relative"
          onClick={() => handleTabChange("following")}
          style={{ cursor: "pointer" }}
        >
          <span
            className={`fw-bold ${type === "following" ? (isDark ? "text-white" : "text-dark") : "text-secondary"}`}
          >
            Takip Edilenler
          </span>
          {type === "following" && (
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x bg-primary"
              style={{ height: "4px", width: "80px", borderRadius: "2px" }}
            />
          )}
        </div>
      </div>

      <div className="follow-list-container flex-grow-1">
        <FollowList userId={userId} type={type} />
      </div>
    </div>
  );
}
