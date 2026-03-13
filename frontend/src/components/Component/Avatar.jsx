import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import UserCard from "./UserCard";

export default function Avatar({
  userId,
  profileImage,
  size = "48px",
  userData,
}) {
  const [showCard, setShowCard] = useState(false);
  const [cardCoords, setCardCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const cardElementRef = useRef(null);
  const avatarSrc = profileImage || import.meta.env.VITE_DEFAULT_AVATAR_URL;

  const updatePosition = () => {
    if (showCard && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

      const actualCardHeight = cardElementRef.current?.offsetHeight || 280;
      const cardWidth = 280;

      let top = rect.bottom + scrollY + 8;
      let left = rect.left + scrollX;

      if (rect.bottom + actualCardHeight > window.innerHeight - 10) {
        top = rect.top + scrollY - actualCardHeight - 8;
      }

      if (rect.left + cardWidth > window.innerWidth - 20) {
        left = rect.right + scrollX - cardWidth;
      }

      setCardCoords({ top, left });
    }
  };

  useLayoutEffect(() => {
    updatePosition();
  }, [showCard, userData]);

  const content = (
    <img
      src={avatarSrc}
      alt="avatar"
      className="rounded-circle shadow-sm"
      style={{ width: size, height: size, objectFit: "cover" }}
    />
  );

  if (!userId) return content;

  return (
    <div
      ref={containerRef}
      className="position-relative d-inline-block"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
      style={{ zIndex: showCard ? 100 : 1 }}
    >
      <Link to={`/profile/${userId}`}>{content}</Link>

      {showCard &&
        userData &&
        createPortal(
          <div
            ref={cardElementRef}
            style={{
              position: "absolute",
              top: `${cardCoords.top}px`,
              left: `${cardCoords.left}px`,
              zIndex: 99999,
              width: "280px",
              pointerEvents: "auto",
            }}
            onMouseEnter={() => setShowCard(true)}
            onMouseLeave={() => setShowCard(false)}
          >
            <UserCard userId={userId} initialData={userData} />
          </div>,
          document.body,
        )}
    </div>
  );
}
