import { Link } from "react-router-dom";

export default function SidebarLogo() {
  const appName = import.meta.env.VITE_APP_NAME;

  return (
    <div className="sidebar-logo-container px-2 mb-3">
      <Link
        to="/"
        className="navbar-brand text-decoration-none fs-4 d-flex align-items-center"
        style={{ color: "inherit" }}
      >
        <span className="fw-bold">{appName}</span>
      </Link>
    </div>
  );
}
