import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  getAllSuggestions,
  getUserSuggestions,
  followUser,
  searchUsers,
} from "../../api/user.api";

import Avatar from "../Component/Avatar";
import "./RightAside.css";

export default function RightAside() {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await getUserSuggestions();
        setSuggestions(res.data);
      } catch (err) {
        console.error("Öneriler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSuggestions();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleExternalFollow = (event) => {
      const { userId } = event.detail;
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    };

    window.addEventListener("userFollowed", handleExternalFollow);

    return () => {
      window.removeEventListener("userFollowed", handleExternalFollow);
    };
  }, []);

  const handleFollow = async (e, userId) => {
    e.preventDefault();
    if (followLoading[userId]) return;

    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      await followUser(userId);
      window.dispatchEvent(
        new CustomEvent("userFollowed", {
          detail: { userId, isFollowing: true },
        }),
      );
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Takip işlemi başarısız.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length > 0) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await searchUsers(value);
          setSearchResults(res.data);
        } catch (err) {
          console.error("Arama hatası:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <aside className="d-none d-lg-block ps-4 pt-2">
      <div className="right-aside-container">
        <div className="position-relative mb-3" ref={searchRef}>
          <div
            className={`search-wrapper rounded-pill px-3 py-1 ${isDark ? "search-wrapper-dark" : ""}`}
          >
            <div className="input-group align-items-center">
              <span className="bg-transparent border-0 ps-2">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className={`form-control bg-transparent border-0 shadow-none search-input ${isDark ? "text-white" : "text-dark"}`}
                placeholder="Ara..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery && (
                <button
                  className="btn btn-link p-0 border-0 text-decoration-none search-clear-btn"
                  onClick={clearSearch}
                  type="button"
                >
                  <i className="bi bi-x-circle-fill text-primary"></i>
                </button>
              )}
            </div>
          </div>

          {searchQuery.trim().length > 0 && showResults && (
            <div
              className={`search-results-dropdown shadow-lg rounded-3 overflow-hidden ${
                isDark ? "bg-dark border-secondary" : "bg-white border-light"
              }`}
              style={{
                position: "absolute",
                top: "50px",
                width: "100%",
                zIndex: 2000,
                border: `1px solid ${isDark ? "#333" : "#eee"}`,
                maxHeight: "350px",
                overflowY: "auto",
                backgroundColor: isDark ? "#000000" : "#ffffff",
              }}
            >
              {isSearching ? (
                <div
                  className={`p-3 text-center small ${isDark ? "text-secondary" : "text-muted"}`}
                >
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  Aranıyor...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className={`suggestion-item text-decoration-none border-bottom ${
                      isDark
                        ? "hover-bg-dark border-secondary"
                        : "hover-bg-light border-light"
                    }`}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowResults(false);
                    }}
                  >
                    <div className="d-flex align-items-center overflow-hidden">
                      <Avatar profileImage={user.profileImage} size="40px" />
                      <div className="d-flex flex-column overflow-hidden suggestion-info ms-2">
                        <span
                          className={`suggestion-name text-truncate ${isDark ? "text-white" : "text-dark"}`}
                        >
                          {user.displayName || user.username}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center">
                  <div className="mb-2">
                    <i
                      className={`bi bi-search fs-4 ${isDark ? "text-secondary" : "text-muted"}`}
                    ></i>
                  </div>
                  <div
                    className={`fw-bold mb-1 ${isDark ? "text-white" : "text-dark"}`}
                  >
                    Sonuç bulunamadı
                  </div>
                  <div
                    className={`small ${isDark ? "text-secondary" : "text-muted"}`}
                  >
                    "<strong>{searchQuery}</strong>" aramasıyla ilgili bir
                    kullanıcı yok.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`suggestions-card ${isDark ? "suggestions-card-dark text-white" : "text-dark"}`}
        >
          {currentUser ? (
            <>
              <div className="px-3 pt-3 mb-2">
                <h5 className="fw-bold mb-0" style={{ fontSize: "20px" }}>
                  Takip Önerisi
                </h5>
              </div>

              <div className="suggestion-list">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((user) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user._id}`}
                      className="suggestion-item text-decoration-none"
                    >
                      <div className="d-flex align-items-center overflow-hidden">
                        <Avatar profileImage={user.profileImage} size="40px" />
                        <div className="d-flex flex-column overflow-hidden suggestion-info ms-2">
                          <span
                            className={`suggestion-name text-truncate ${isDark ? "text-white" : "text-dark"}`}
                          >
                            {user.username}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleFollow(e, user._id)}
                        className={`follow-btn ${isDark ? "dark-follow-btn" : "light-follow-btn"}`}
                        disabled={followLoading[user._id]}
                      >
                        {followLoading[user._id] ? "..." : "Takip et"}
                      </button>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-4 text-muted small mb-0 text-center">
                    Önerilecek yeni kimse kalmadı.
                  </p>
                )}
              </div>

              <div
                onClick={() => navigate("/connect_people")}
                className="show-more-btn"
                role="button"
              >
                Daha fazla göster
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <h5 className="fw-bold mb-2">Platforma yeni misin?</h5>
              <p className="text-muted small mb-3">
                Kendi akışını oluşturmak için hemen kayıt ol veya giriş yap!
              </p>
              <button
                onClick={() => navigate("/register")}
                className="btn btn-primary rounded-pill w-100 fw-bold mb-2 py-2"
                style={{ backgroundColor: "#1d9bf0", border: "none" }}
              >
                Hesap oluştur
              </button>
              <button
                onClick={() => navigate("/login")}
                className={`btn rounded-pill w-100 fw-bold py-2 ${isDark ? "btn-outline-light" : "btn-outline-dark"}`}
              >
                Giriş yap
              </button>
            </div>
          )}
        </div>

        <div
          className={`mt-3 px-3 aside-footer-text ${isDark ? "aside-footer-text-dark" : ""}`}
          style={{ fontSize: "13px", lineHeight: "1.5" }}
        >
          <div className="d-flex flex-wrap gap-x-3 gap-y-1">
            <span className="cursor-pointer hover-underline me-2">
              Hizmet Şartları
            </span>
            <span className="cursor-pointer hover-underline me-2">
              Gizlilik Politikası
            </span>
            <span className="cursor-pointer hover-underline me-2">
              Çerez Politikası
            </span>
            <span className="cursor-pointer hover-underline">
              Erişilebilirlik
            </span>
          </div>
          <div className="mt-2 opacity-75">
            © 2026 {import.meta.env.VITE_APP_NAME} Corp.
          </div>
        </div>
      </div>
    </aside>
  );
}
