import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContextInstance";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme, ThemeProvider içerisinde kullanılmalıdır!");
  }
  return context;
};
