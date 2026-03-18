import { useTheme } from "../../hooks/useTheme";

export default function Loading({ message = "Yükleniyor..." }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "50vh" }}
    >
      <div
        className={`spinner-border ${isDark ? "text-info" : "text-primary"}`}
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Yükleniyor...</span>
      </div>

      <p
        className="mt-3 fw-bold"
        style={{
          color: isDark ? "#e7e9ea" : "#6c757d",
          transition: "color 0.3s ease",
        }}
      >
        {message}
      </p>
    </div>
  );
}
