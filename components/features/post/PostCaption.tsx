'use client';

interface PostCaptionProps {
  username: string;
  caption: string;
  className?: string;
}

export function PostCaption({ username, caption, className = '' }: PostCaptionProps) {
  if (!caption) return null;

  return (
    <div className={`px-4 py-2 ${className}`}>
      <p className="text-black text-sm leading-relaxed">
        <span className="font-medium mr-2">{username}</span>
        {caption}
      </p>
    </div>
  );
}
