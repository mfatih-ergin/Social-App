import "./SidebarPostButton.css";
export default function SidebarPostButton({ onClick, user }) {
  if (!user) return null;

  return (
    <button className="btn-post-custom shadow-sm" onClick={onClick}>
      <span>Gönderi Paylaş</span>
    </button>
  );
}
