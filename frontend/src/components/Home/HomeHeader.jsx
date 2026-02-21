import { useTheme } from "../../context/ThemeContext";

export default function HomeHeader() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`d-flex align-items-center px-3 sticky-top ${
        isDark ? "bg-black bg-opacity-75" : "bg-white bg-opacity-75"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        height: "75px",
        borderBottom: isDark ? "1px solid #2f3336" : "1px solid #eff3f4",
      }}
    >
      <h5 className="mb-0 fw-bold fs-5">Ana Sayfa</h5>
    </div>
  );
}
