import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (!user) {
      setTheme("light");
    } else if (user?.settings?.theme) {
      setTheme(user.settings.theme);
    }
  }, [user]);

  const toggleTheme = (newTheme) => {
    if (user) {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  const activeTheme = user ? theme : "light";

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
