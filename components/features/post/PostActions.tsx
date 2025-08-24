'use client';

import { Heart, MessageCircle } from 'lucide-react';

interface PostActionsProps {
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  onLike: () => void;
  onCommentClick: () => void;
  className?: string;
}

export function PostActions({ 
  likesCount, 
  isLiked, 
  commentsCount, 
  onLike, 
  onCommentClick,
  className = '' 
}: PostActionsProps) {
  return (
    <div className={`flex items-center px-4 py-3 space-x-4 ${className}`}>
      <button
        onClick={onLike}
        className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-black'}`}
      >
        <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm">{likesCount}</span>
      </button>
      
      <button
        onClick={onCommentClick}
        className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-sm">{commentsCount}</span>
      </button>
    </div>
  );
}
