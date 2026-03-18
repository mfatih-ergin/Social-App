import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { ThemeContext } from "./ThemeContextInstance";

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const activeTheme = user && !isAuthPage ? theme : "light";

  useEffect(() => {
    if (activeTheme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [activeTheme]);

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

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
