'use client';

import { PostImage } from './PostImage';
import { PostActions } from './PostActions';
import { PostCaption } from './PostCaption';

interface PostContentProps {
  imageUrl: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  username: string;
  caption: string;
  onLike: () => void;
  onCommentClick: () => void;
  className?: string;
}

export function PostContent({
  imageUrl,
  likesCount,
  isLiked,
  commentsCount,
  username,
  caption,
  onLike,
  onCommentClick,
  className = ''
}: PostContentProps) {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      {/* Post Image */}
      <PostImage imageUrl={imageUrl} />
      
      {/* Post Actions */}
      <PostActions
        likesCount={likesCount}
        isLiked={isLiked}
        commentsCount={commentsCount}
        onLike={onLike}
        onCommentClick={onCommentClick}
      />
      
      {/* Post Caption */}
      <PostCaption username={username} caption={caption} />
    </div>
  );
}
