import Like from "./Like";
import CommentButton from "./CommentButton";
import SaveButton from "./SaveButton";
import RepostButton from "./RepostButton";

export default function PostActions({
  postId,
  likedByCurrentUser,
  likesCount,
  commentsCount,
  repostsCount,
  isRepostedByMe,
  onCommentClick,
  onRepostClick,
  onQuoteClick,
  isSavedByMe,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center pt-1">
      <div className="d-flex align-items-center gap-4">
        <Like
          postId={postId}
          likedByCurrentUser={likedByCurrentUser}
          likesCount={likesCount}
        />

        <CommentButton
          commentsCount={commentsCount}
          onClick={(e) => onCommentClick(e)}
        />

        <RepostButton
          repostsCount={repostsCount}
          isReposted={isRepostedByMe}
          onRepost={onRepostClick}
          onQuote={onQuoteClick}
        />
      </div>

      <SaveButton contentId={postId} isSavedInitial={isSavedByMe} type="post" />
    </div>
  );
}
