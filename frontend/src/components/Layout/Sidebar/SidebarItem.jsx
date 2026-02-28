import { NavLink } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({
  to,
  label,
  icon,
  activeIcon,
  isAuthRequired = false,
  user,
}) {
  if (isAuthRequired && !user) return null;

  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav-link-custom ${isActive ? "active" : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span className="icon-box">
              <i className={`bi ${isActive ? activeIcon || icon : icon}`}></i>
            </span>
            <span className={isActive ? "fw-bold" : ""}>{label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}
