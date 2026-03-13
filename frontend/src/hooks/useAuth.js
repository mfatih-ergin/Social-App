import { useContext } from "react";
import { AuthContext } from "../context/AuthContextInstance";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth, AuthProvider içerisinde kullanılmalıdır!");
  }
  return context;
};
