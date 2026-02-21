import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Explore from "../pages/Explore";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import BookmarksPage from "../pages/BookmarksPage";
import Settings from "../pages/Settings";
import ThreadPage from "../pages/ThreadPage";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/home" element={<Home />} />

      <Route path="/post/:contentId" element={<ThreadPage type="post" />} />
      <Route
        path="/comment/:contentId"
        element={<ThreadPage type="comment" />}
      />

      <Route
        path="/bookmarks"
        element={
          <PrivateRoute>
            <BookmarksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

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
