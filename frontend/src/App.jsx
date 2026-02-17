import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Header from "./components/Layout/Header";
import Navbar from "./components/Layout/Navbar";

import Home from "./pages/Home";
import Explore from "./pages/Explore";

import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import Profile from "./pages/ProfilePage";

import Settings from "./pages/Settings";
import PostPage from "./pages/PostPage";

function App() {
  const location = useLocation();
  const { user } = useAuth();

  const hideLayoutRoutes = ["/login", "/register"];
  const showLayout = !hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        {showLayout && (
          <aside className="bg-dark" style={{ width: "280px" }}>
            <Navbar />
          </aside>
        )}

        <div className="d-flex flex-column flex-grow-1">
          <main className="flex-grow-1 p-0 bg-light">
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              {/* <Route path="/post/:postId" element={<PostPage />} /> */}
              <Route
                path="/post/:contentId"
                element={<PostPage type="post" />}
              />
              <Route
                path="/comment/:contentId"
                element={<PostPage type="comment" />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
