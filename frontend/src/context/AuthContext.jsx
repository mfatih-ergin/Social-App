import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContextInstance";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.error("Doğrulama hatası:", error);
          localStorage.removeItem("token");
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);

      if (userData.settings?.theme) {
        localStorage.setItem("theme", userData.settings.theme);
      }

      setUser(userData);
      setLoading(false);
      window.dispatchEvent(new Event("storage"));

      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setLoading(false);

      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("theme", "light");
    setUser(null);
    setLoading(false);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, setUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
