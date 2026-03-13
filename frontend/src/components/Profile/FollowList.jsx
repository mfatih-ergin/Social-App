import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFollowers, getFollowing } from "../../api/user.api";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../Component/Avatar";
import Loading from "../Loading";
import FollowButton from "../Component/FollowButton";

export default function FollowList({ userId, type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res =
          type === "followers"
            ? await getFollowers(userId)
            : await getFollowing(userId);

        setUsers(res.data || []);
      } catch (err) {
        console.error("Liste yüklenemedi:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchList();
    }
  }, [userId, type]);

  if (loading) return <Loading message="Liste yükleniyor..." />;

  if (users.length === 0) {
    return (
      <div className="p-5 text-center text-secondary flex-grow-1">
        <p className="fw-bold fs-5">Henüz kimse yok</p>
        <p className="small">Bu liste şu anlık boş görünüyor.</p>
      </div>
    );
  }

  return (
    <div className="w-100 flex-grow-1">
      {users.map((u) => {
        const isFollowingInitial = u.followers?.some(
          (followerId) =>
            followerId.toString() === currentUser?._id?.toString(),
        );

        return (
          <div
            key={u._id}
            className="d-flex align-items-start p-3 border-bottom border-secondary border-opacity-10 hover-effect"
            style={{ cursor: "pointer", transition: "0.2s" }}
            onClick={() => navigate(`/profile/${u._id}`)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Avatar
                profileImage={u.profileImage}
                size="50px"
                userId={u._id}
              />
            </div>

            <div className="ms-3 flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-0">{u.username}</h6>
                  {/* <p className="text-secondary small mb-0">
                    @{u.username.toLowerCase()}
                  </p> */}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <FollowButton
                    targetUserId={u._id}
                    initialIsFollowing={isFollowingInitial}
                  />
                </div>
              </div>

              <p
                className="mt-2 mb-0 small text-break text-secondary"
                style={{ lineHeight: "1.3", maxWidth: "90%" }}
              >
                {u.bio || "Social App kullanıcısı"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
