import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Sidebar/Sidebar";
import RightAside from "./RightAside";
import Header from "./Header";

export default function MainLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === "dark";

  const isMainProfilePage =
    location.pathname.split("/").length === 3 &&
    location.pathname.startsWith("/profile");

  return (
    <div
      className={`min-vh-100 ${isDark ? "bg-black text-white" : "bg-white text-dark"}`}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          {/* <div className="col-auto col-md-3 col-lg-2 d-flex justify-content-end p-0">
             <Sidebar />
          </div> */}

          <div
            className={`col-12 col-md-8 col-lg-6 border-start border-end min-vh-100 p-0 ${
              isDark ? "border-secondary" : "border-light"
            }`}
          >
            {!isMainProfilePage && <Header />}
            <Outlet />
          </div>

          <div className="col-lg-4 d-none d-lg-block ps-4">
            <div className="sticky-top pt-2">
              <RightAside />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
