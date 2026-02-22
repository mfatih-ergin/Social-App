import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { updateProfile } from "../../api/user.api";
import api from "../../api/axios";
import "../../styles/EditProfileModal.css";

export default function EditProfileModal({ isOpen, onClose, onUpdate }) {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [birthday, setBirthday] = useState(() => {
    if (user?.birthday) {
      const date = new Date(user.birthday);
      if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
    }
    return "";
  });

  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(user?.profileImage);
  const [bannerPreview, setBannerPreview] = useState(user?.banner);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const profileInputRef = useRef();
  const bannerInputRef = useRef();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        type === "profile"
          ? setProfilePreview(reader.result)
          : setBannerPreview(reader.result);
        type === "profile" ? setProfileFile(file) : setBannerFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("birthday", birthday);
    if (profileFile) formData.append("profileImage", profileFile);
    if (bannerFile) formData.append("banner", bannerFile);

    try {
      await updateProfile(formData);
      const response = await api.get("/auth/me");
      setUser(response.data);
      if (onUpdate) await onUpdate(true);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block edit-profile-modal"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}
      data-theme={theme}
    >
      <div className="modal-dialog modal-dialog-centered">
        {" "}
        <div
          className="modal-content shadow-lg border-0"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-header border-0 px-3 py-2 d-flex align-items-center">
              <button
                type="button"
                className="btn border-0 p-0 me-3 shadow-none"
                onClick={onClose}
              >
                <i className="bi bi-x-lg" style={{ fontSize: "1.2rem" }}></i>
              </button>
              <h5 className="modal-title fw-bold flex-grow-1 m-0">
                Profili Düzenle
              </h5>

              <button
                type="submit"
                className={`btn rounded-pill px-4 fw-bold shadow-none ${isDark ? "btn-light" : "btn-dark"}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>

            <div
              className="modal-body p-0"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              <div
                className="position-relative"
                style={{
                  height: "170px",
                  backgroundImage: `url(${bannerPreview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: isDark ? "#333" : "#e9ecef",
                }}
              >
                <div
                  className="w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                >
                  <button
                    type="button"
                    className="btn btn-dark btn-sm rounded-circle opacity-75"
                    onClick={() => bannerInputRef.current.click()}
                  >
                    <i className="bi bi-camera fs-5"></i>
                  </button>
                </div>
                <input
                  type="file"
                  hidden
                  ref={bannerInputRef}
                  onChange={(e) => handleImageChange(e, "banner")}
                  accept="image/*"
                />
              </div>

              <div className="px-3" style={{ marginTop: "-50px" }}>
                <div className="position-relative d-inline-block">
                  <img
                    src={profilePreview}
                    className={`rounded-circle border border-4 ${isDark ? "border-black" : "border-white"}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      backgroundColor: isDark ? "#000" : "#fff",
                    }}
                    alt="Profil"
                  />
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <button
                      type="button"
                      className="btn btn-dark btn-sm rounded-circle opacity-75"
                      onClick={() => profileInputRef.current.click()}
                    >
                      <i className="bi bi-camera fs-6"></i>
                    </button>
                  </div>
                  <input
                    type="file"
                    hidden
                    ref={profileInputRef}
                    onChange={(e) => handleImageChange(e, "profile")}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="p-3">
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    İsim
                  </label>
                  <input
                    type="text"
                    className="form-control py-2 fs-6"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Biyografi
                  </label>
                  <textarea
                    className="form-control fs-6 py-2"
                    rows="4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength="160"
                  ></textarea>
                  <div className="text-end small mt-1 opacity-75">
                    {bio.length}/160
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    className="form-control py-2 fs-6"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
