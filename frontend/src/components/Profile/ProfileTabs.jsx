import { useTheme } from "../../context/ThemeContext";

export default function ProfileTabs({ activeTab, setActiveTab, isOwnProfile }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tabs = [
    { id: "posts", label: "Gönderiler" },
    { id: "likes", label: "Beğenilenler" },
  ];

  if (isOwnProfile) {
    tabs.push({ id: "saved", label: "Kaydedilenler" });
  }

  return (
    <div className={`px-4 border-bottom ${isDark ? "border-secondary" : ""}`}>
      <ul className="nav nav-tabs nav-fill border-0">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link border-0 rounded-0 py-3 ${
                activeTab === tab.id
                  ? isDark
                    ? "active bg-transparent text-white border-bottom border-primary border-3"
                    : "active bg-transparent fw-bold border-bottom border-dark border-3"
                  : isDark
                    ? "text-secondary hover-dark-tab"
                    : "text-muted hover-light-tab"
              }`}
              style={{
                backgroundColor: "transparent",
                transition: "color 0.2s, border-bottom 0.2s",
                fontWeight: activeTab === tab.id ? "600" : "400",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
