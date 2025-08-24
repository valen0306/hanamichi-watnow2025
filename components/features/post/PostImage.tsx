'use client';

interface PostImageProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

export function PostImage({ imageUrl, alt = "投稿画像", className = '' }: PostImageProps) {
  return (
    <div className={`w-full ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-cover"
        />
      ) : (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">画像がありません</p>
        </div>
      )}
    </div>
  );
}
