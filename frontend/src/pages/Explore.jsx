import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import ExplorePostList from "../components/Post/ExplorePostList";
import RightAside from "../components/Layout/RightAside";

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    document.title = `Keşfet / ${import.meta.env.VITE_APP_NAME}`;
  }, []);

  return (
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
      style={{ transition: "background-color 0.3s ease" }}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div
            className={`col-12 col-md-8 col-lg-6 border-start border-end min-vh-100 p-0 ${
              isDark ? "border-secondary" : "border-light"
            }`}
          >
            <div
              className={`d-flex align-items-center px-4 sticky-top ${
                isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
              }`}
              style={{
                backdropFilter: "blur(10px)",
                zIndex: 1050,
                height: "75px",
                borderBottom: isDark
                  ? "1px solid #2f3336"
                  : "1px solid #eff3f4",
              }}
            >
              <h5
                className="mb-0 fw-extrabold fs-4"
                style={{ letterSpacing: "-0.5px" }}
              >
                Keşfet
              </h5>
            </div>

            <div className="p-0">
              <ExplorePostList />
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <RightAside />
          </div>
        </div>
      </div>
    </div>
  );
}
