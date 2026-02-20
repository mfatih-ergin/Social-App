import Like from "./LikeButton";
import CommentButton from "./CommentButton";
import SaveButton from "./SaveButton";
import RepostButton from "./RepostButton";

/**
 * @param {Object} props
 * @param {string} props.id - Post veya Comment ID'si
 * @param {string} props.type - "post" veya "comment"
 * @param {number} props.count - Yorum veya Yanıt sayısı
 */
export default function ContentActions({
  id,
  type = "post", // Varsayılan "post"
  likedByCurrentUser,
  likesCount,
  count, // commentsCount veya repliesCount yerine tek isim
  repostsCount,
  isRepostedByMe,
  isSavedByMe,
  onActionClick, // onCommentClick veya onReplyClick yerine
  onRepostClick,
  onQuoteClick,
}) {
  const isComment = type === "comment";

  return (
    <div className="d-flex justify-content-between align-items-center pt-1">
      <div className="d-flex align-items-center gap-4 w-100">
        <Like
          id={id}
          likedByCurrentUser={likedByCurrentUser}
          likesCount={likesCount}
          isComment={isComment}
        />

        <CommentButton
          commentsCount={count}
          onClick={(e) => onActionClick(e)}
        />

        <RepostButton
          repostsCount={repostsCount}
          isReposted={isRepostedByMe}
          onRepost={onRepostClick}
          onQuote={onQuoteClick}
        />
      </div>

      <SaveButton contentId={id} isSavedInitial={isSavedByMe} type={type} />
    </div>
  );
}
