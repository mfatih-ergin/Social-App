import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { useTheme } from "../../hooks/useTheme";

export default function UserInfo({
  userId,
  username,
  profileImage,
  createdAt = null,
  formatTime = null,
  allUserData,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleStopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="d-flex align-items-center" onClick={handleStopPropagation}>
      <Avatar
        userId={userId}
        profileImage={profileImage}
        size="45px"
        userData={allUserData}
      />

      <div className="ms-2">
        <Link
          to={`/profile/${userId}`}
          className={`text-decoration-none d-block ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem" }}>
            {username}
          </h6>
        </Link>

        {createdAt && formatTime && (
          <small
            className={`${isDark ? "text-secondary" : "text-muted"}`}
            style={{ fontSize: "0.75rem" }}
          >
            {formatTime(createdAt)}
          </small>
        )}
      </div>
    </div>
  );
}
