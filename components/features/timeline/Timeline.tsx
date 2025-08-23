'use client'

import { useState, useEffect } from 'react'
import { PhotoGrid } from './PhotoGrid'
import { getRecentPostImages } from '@/lib/post'

interface PostImage {
  id: string
  post_id: string
  image_url: string
  embedded_im?: string
  latitude?: number
  longitude?: number
  created_at: string
}

interface TimelineProps {
  className?: string
}

export function Timeline({ className = '' }: TimelineProps) {
  const [images, setImages] = useState<PostImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(30) // より多くの画像を表示

  // 初期データの読み込み
  useEffect(() => {
    loadImages()
  }, [])

  // 画像データの読み込み
  const loadImages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const recentImages = await getRecentPostImages(limit)
      setImages(recentImages)
      
      setHasMore(recentImages.length === limit)
    } catch (err) {
      console.error('Failed to load images:', err)
      setError('画像の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // もっと見る機能
  const loadMore = async () => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      const nextPage = page + 1
      
      const moreImages = await getRecentPostImages(limit)
      
      if (moreImages.length > 0) {
        setImages(prev => [...prev, ...moreImages])
        setPage(nextPage)
        setHasMore(moreImages.length === limit)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load more images:', err)
      setError('追加の画像の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 画像クリック時の処理
  const handleImageClick = (image: PostImage) => {
    console.log('Image clicked:', image)
    // ここで画像の詳細表示やモーダル表示などの処理を追加
  }

  // エラー表示
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadImages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* 投稿がない場合の表示 */}
      {images.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">まだ投稿がありません</h3>
          <p className="text-gray-600">最初の投稿を作成してみましょう！</p>
        </div>
      ) : (
        /* 画像グリッド */
        <PhotoGrid
          images={images}
          onImageClick={handleImageClick}
        />
      )}

      {/* ローディング状態 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      )}

      {/* もっと見るボタン */}
      {hasMore && !loading && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  )
}
