import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import FollowList from "../components/Profile/FollowList";
import RightAside from "../components/Layout/RightAside";

export default function FollowPage() {
  const { userId, type } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const title = type === "following" ? "Takip Edilenler" : "Takipçiler";

  const handleTabChange = (newType) => {
    if (newType !== type) {
      navigate(`/profile/${userId}/${newType}`, { replace: true });
    }
  };

  return (
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
    >
      <div className="container p-0" style={{ maxWidth: "1050px" }}>
        <div className="row g-0">
          <main
            className={`col-12 col-lg-7 border-start border-end d-flex flex-column min-vh-100 p-0 ${
              isDark ? "border-secondary border-opacity-25" : "border-light"
            }`}
            style={{
              borderColor: isDark ? "#2f3336 !important" : "#eff3f4 !important",
            }}
          >
            <div
              className={`sticky-top ${
                isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
              }`}
              style={{
                backdropFilter: "blur(10px)",
                zIndex: 1050,
                borderBottom: isDark
                  ? "1px solid #2f3336"
                  : "1px solid #eff3f4",
              }}
            >
              <div
                className="d-flex align-items-center px-3"
                style={{ height: "75px" }}
              >
                <button
                  className={`btn border-0 p-0 me-4 d-flex align-items-center justify-content-center rounded-circle ${
                    isDark ? "text-white" : "text-dark"
                  }`}
                  style={{ width: "35px", height: "35px" }}
                  onClick={() => navigate(`/profile/${userId}`)}
                >
                  <i className="bi bi-arrow-left fs-5"></i>
                </button>
                <h5 className="mb-0 fw-bold fs-5">{title}</h5>
              </div>

              <div className="d-flex">
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
                      style={{
                        height: "4px",
                        width: "56px",
                        borderRadius: "2px",
                      }}
                    ></div>
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
                      style={{
                        height: "4px",
                        width: "80px",
                        borderRadius: "2px",
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>

            <div className="follow-list-container flex-grow-1">
              <FollowList userId={userId} type={type} />
            </div>
          </main>

          <aside className="col-lg-5 d-none d-lg-block ps-4">
            <RightAside />
          </aside>
        </div>
      </div>
    </div>
  );
}
