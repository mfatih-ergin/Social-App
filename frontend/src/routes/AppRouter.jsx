import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../components/Layout/MainLayout";

import Home from "../pages/Home";
import Explore from "../pages/Explore";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import BookmarksPage from "../pages/BookmarksPage";
import Settings from "../pages/Settings";
import ThreadPage from "../pages/ThreadPage";
import FollowPage from "../pages/FollowPage";
import ConnectPeople from "../pages/ConnectPeople";

export default function AppRouter() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const path = location.pathname;

    const titles = {
      "/home": "Ana Sayfa",
      "/explore": "Keşfet",
      "/bookmarks": "Yer İşaretleri",
      "/settings": "Ayarlar",
      "/login": "Giriş Yap",
      "/register": "Kayıt Ol",
      "/connect_people": "Takip Et",
    };

    if (titles[path]) {
      document.title = `${titles[path]} / ${import.meta.env.VITE_APP_NAME}`;
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/post/:contentId" element={<ThreadPage type="post" />} />
        <Route
          path="/comment/:contentId"
          element={<ThreadPage type="comment" />}
        />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile/:userId/:type" element={<FollowPage />} />
        <Route
          path="/bookmarks"
          element={
            <PrivateRoute>
              <BookmarksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/connect_people"
          element={
            <PrivateRoute>
              <ConnectPeople />
            </PrivateRoute>
          }
        />
      </Route>

      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/explore" replace />
          )
        }
      />
    </Routes>
  );
}
