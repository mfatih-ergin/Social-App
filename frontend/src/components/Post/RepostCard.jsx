// // import { useNavigate } from "react-router-dom";
// // import { useTheme } from "../../context/ThemeContext";
// // import { formatRelativeTime } from "../Component/DateInfo";
// // import Avatar from "../Component/Avatar";
// // import "../../styles/RepostCard.css";

// // export default function RepostCard({ post, isComment = false }) {
// //   const { theme } = useTheme();
// //   const navigate = useNavigate();
// //   const isDark = theme === "dark";

// //   if (!post) return null;

// //   const source = post._doc || post;

// //   const userData = source?.user || {};
// //   const username = userData?.username || source?.username || "Kullanıcı";
// //   const profileImage = userData?.profileImage || source?.profileImage;
// //   const userId = userData?._id || userData?.id || source?.userId;

// //   const contentText = source?.text || "";
// //   const contentImage = source?.image || "";
// //   const createdAt = source?.createdAt;
// //   const id = source?._id || source?.id;

// //   const handleCardClick = (e) => {
// //     e.stopPropagation();
// //     if (!id) return;

// //     const targetPath = isComment ? `/comment/detail/${id}` : `/post/${id}`;
// //     navigate(targetPath);
// //   };

// //   return (
// //     <div
// //       onClick={handleCardClick}
// //       className={`repost-ghost-view ${isDark ? "text-white" : "text-dark"}`}
// //       style={{ position: "relative", zIndex: 10 }}
// //     >
// //       <div className="d-flex align-items-center gap-2 mb-2">
// //         <Avatar userId={userId} profileImage={profileImage} size="22px" />
// //         <span
// //           className="fw-bold small text-truncate"
// //           style={{ maxWidth: "180px" }}
// //         >
// //           {username}
// //         </span>
// //         <span className="text-secondary small">·</span>
// //         <span className="text-secondary" style={{ fontSize: "0.8rem" }}>
// //           {createdAt ? formatRelativeTime(createdAt) : ""}
// //         </span>
// //       </div>

// //       <div className="repost-body-clean">
// //         {contentText.trim() && (
// //           <p className="repost-text-clean mb-2">{contentText}</p>
// //         )}

// //         {contentImage && (
// //           <div className="repost-mini-image mb-0 overflow-hidden rounded-3">
// //             <img
// //               src={
// //                 contentImage.startsWith("http")
// //                   ? contentImage
// //                   : `http://localhost:5000${contentImage}`
// //               }
// //               alt="repost content"
// //               style={{
// //                 width: "auto",
// //                 height: "auto",
// //                 maxWidth: "100%",
// //                 maxHeight: "350px",
// //                 objectFit: "contain",
// //                 display: "block",
// //               }}
// //             />
// //           </div>
// //         )}

// //         {!contentText.trim() && !contentImage && (
// //           <p className="small mb-0 text-muted opacity-50 fst-italic">
// //             İçerik yüklenemedi.
// //           </p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// import { useNavigate } from "react-router-dom";
// import { useTheme } from "../../context/ThemeContext";
// import { formatRelativeTime } from "../Component/DateInfo";
// import Avatar from "../Component/Avatar";
// import "../../styles/RepostCard.css";

// export default function RepostCard({ post, isComment = false }) {
//   const { theme } = useTheme();
//   const navigate = useNavigate();
//   const isDark = theme === "dark";

//   if (!post) return null;

//   const source = post._doc || post;

//   const userData = source?.user || {};
//   const username = userData?.username || source?.username || "Kullanıcı";
//   const profileImage = userData?.profileImage || source?.profileImage;
//   const userId = userData?._id || userData?.id || source?.userId;

//   const contentText = source?.text || "";
//   const contentImage = source?.image || "";
//   const createdAt = source?.createdAt;
//   const id = source?._id || source?.id;

//   const handleCardClick = (e) => {
//     e.stopPropagation();
//     if (!id) return;

//     // BURAYI DÜZELTTİK: /detail/ kaldırıldı
//     const targetPath = isComment ? `/comment/${id}` : `/post/${id}`;
//     navigate(targetPath);
//   };

//   return (
//     <div
//       onClick={handleCardClick}
//       className={`repost-ghost-view ${isDark ? "text-white" : "text-dark"}`}
//       style={{ position: "relative", zIndex: 10 }}
//     >
//       <div className="d-flex align-items-center gap-2 mb-2">
//         <Avatar userId={userId} profileImage={profileImage} size="22px" />
//         <span
//           className="fw-bold small text-truncate"
//           style={{ maxWidth: "180px" }}
//         >
//           {username}
//         </span>
//         <span className="text-secondary small">·</span>
//         <span className="text-secondary" style={{ fontSize: "0.8rem" }}>
//           {createdAt ? formatRelativeTime(createdAt) : ""}
//         </span>
//       </div>

//       <div className="repost-body-clean">
//         {contentText.trim() && (
//           <p className="repost-text-clean mb-2">{contentText}</p>
//         )}

//         {contentImage && (
//           <div className="repost-mini-image mb-0 overflow-hidden rounded-3">
//             <img
//               src={
//                 contentImage.startsWith("http")
//                   ? contentImage
//                   : `http://localhost:5000${contentImage}`
//               }
//               alt="repost content"
//               style={{
//                 width: "auto",
//                 height: "auto",
//                 maxWidth: "100%",
//                 maxHeight: "350px",
//                 objectFit: "contain",
//                 display: "block",
//               }}
//             />
//           </div>
//         )}

//         {!contentText.trim() && !contentImage && (
//           <p className="small mb-0 text-muted opacity-50 fst-italic">
//             İçerik yüklenemedi.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { formatRelativeTime } from "../Component/DateInfo";
import Avatar from "../Component/Avatar";
import CardLayout from "../Layout/CardLayout";

export default function RepostCard({ post, isComment = false }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  if (!post) return null;

  // Veri kaynağını normalize et (MongoDB _doc veya düz obje)
  const source = post._doc || post;

  const userData = source?.user || {};
  const username = userData?.username || source?.username || "Kullanıcı";
  const profileImage = userData?.profileImage || source?.profileImage;
  const userId = userData?._id || userData?.id || source?.userId;

  const contentText = source?.text || "";
  const contentImage = source?.image || "";
  const createdAt = source?.createdAt;
  const id = source?._id || source?.id;

  const handleCardClick = (e) => {
    // Önemli: İçteki karta tıklandığında dıştaki postun detayına gitmeyi engeller
    e.stopPropagation();

    if (!id) return;

    // API linki değil, React Router sayfa linki (detail içermez)
    const targetPath = isComment ? `/comment/${id}` : `/post/${id}`;
    navigate(targetPath);
  };

  return (
    <div className="repost-container-wrapper mt-2">
      <CardLayout theme={theme} clickable={true} onClick={handleCardClick}>
        {/* Kullanıcı Bilgileri Bölümü */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <Avatar userId={userId} profileImage={profileImage} size="20px" />
          <span
            className="fw-bold small text-truncate"
            style={{ maxWidth: "150px", fontSize: "0.85rem" }}
          >
            {username}
          </span>
          <span className="text-secondary small">·</span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {createdAt ? formatRelativeTime(createdAt) : ""}
          </span>
        </div>

        {/* İçerik Bölümü */}
        <div className="repost-content">
          {contentText.trim() && (
            <p
              className="content-text mb-2"
              style={{ fontSize: "0.9rem", lineHeight: "1.4" }}
            >
              {contentText}
            </p>
          )}

          {/* Akıllı Resim Yönetimi (CardLayout.css'deki sınıfları kullanır) */}
          {contentImage && (
            <div className="post-media-wrapper" style={{ marginTop: "5px" }}>
              <img
                src={
                  contentImage.startsWith("http")
                    ? contentImage
                    : `http://localhost:5000${contentImage}`
                }
                alt="repost content"
                className="post-image"
                style={{ maxHeight: "300px" }} // İç kartta daha derli toplu durması için
              />
            </div>
          )}

          {/* İçerik Yoksa (Hata durumu veya silinmiş içerik) */}
          {!contentText.trim() && !contentImage && (
            <p className="small mb-0 text-muted opacity-50 fst-italic">
              İçerik yüklenemedi veya artık mevcut değil.
            </p>
          )}
        </div>
      </CardLayout>
    </div>
  );
}
