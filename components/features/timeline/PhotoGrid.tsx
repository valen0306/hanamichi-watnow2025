'use client'

import { useState } from 'react'

interface PostImage {
  id: string
  post_id: string
  image_url: string
  embedded_im?: string
  latitude?: number
  longitude?: number
  created_at: string
}

interface PhotoGridProps {
  images: PostImage[]
  onImageClick?: (image: PostImage, postId: string) => void
  className?: string
}

export function PhotoGrid({ images, onImageClick, className = '' }: PhotoGridProps) {
  if (!images || images.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>まだ画像がありません</p>
      </div>
    )
  }

  const handleImageClick = (image: PostImage) => {
    // post_idを取得して、onImageClickコールバックに渡す
    if (onImageClick) {
      onImageClick(image, image.post_id)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* インスタグラム風の3列グリッド */}
      <div className="grid grid-cols-3 gap-px bg-gray-200 w-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="aspect-square bg-gray-300 relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(image)}
          >
            {/* 画像がある場合は表示、ない場合はグレーの四角 */}
            {image.image_url ? (
              <img
                src={image.image_url}
                alt={`投稿画像 ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
