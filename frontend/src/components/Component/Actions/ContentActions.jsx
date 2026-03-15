import Like from "./Like/LikeButton";
import CommentButton from "./Comment/CommentButton";
import SaveButton from "./Save/SaveButton";
import RepostButton from "./Repost/RepostButton";

export default function ContentActions({
  id,
  type = "post",
  likedByCurrentUser,
  likesCount,
  count,
  repostsCount,
  isRepostedByMe,
  isSavedByMe,
  collectionIds,
  onActionClick,
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

      <SaveButton
        contentId={id}
        isSavedInitial={isSavedByMe}
        type={type}
        initialCollectionIds={collectionIds}
      />
    </div>
  );
}
