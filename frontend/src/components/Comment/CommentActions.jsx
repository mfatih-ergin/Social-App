import Like from "../Component/Actions/Like";
import CommentButton from "../Component/Actions/CommentButton";
import SaveButton from "../Component/Actions/SaveButton";
import RepostButton from "../Component/Actions/RepostButton";

export default function CommentActions({
  commentId,
  likedByCurrentUser,
  likesCount,
  repliesCount,
  onReplyClick,
  repostsCount,
  isRepostedByMe,
  onRepostClick,
  onQuoteClick,
  isSavedByMe,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center pt-1">
      <div className="d-flex align-items-center gap-4 w-100">
        <Like
          postId={commentId}
          likedByCurrentUser={likedByCurrentUser}
          likesCount={likesCount}
          isComment={true}
        />
        <CommentButton commentsCount={repliesCount} onClick={onReplyClick} />

        <RepostButton
          repostsCount={repostsCount}
          isReposted={isRepostedByMe}
          onRepost={onRepostClick}
          onQuote={onQuoteClick}
        />
      </div>

      <SaveButton
        contentId={commentId}
        isSavedInitial={isSavedByMe}
        type="comment"
      />
    </div>
  );
}
