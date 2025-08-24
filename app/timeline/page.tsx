'use client'

import { Timeline } from "@/components/features/timeline/Timeline"
import { SearchBar } from "@/components/features/timeline/SearchBar"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to auth...')
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // 認証中は何も表示しない
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500">認証状態を確認中...</div>
        </div>
      </div>
    )
  }

  // 未認証の場合は何も表示しない
  if (!user) {
    return null
  }

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // ここで検索処理を実装
  }

  return (
    <div className="h-screen bg-white fixed inset-0">
      {/* Fixed Header with Search */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <SearchBar onSearch={handleSearch} />
      </header>

      {/* Main Content - Timeline with responsive spacing */}
      <main className="pt-32 pb-8 px-4 h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] md:h-[calc(100vh-6rem)] lg:h-[calc(100vh-5rem)] overflow-hidden">
        <Timeline />
      </main>
    </div>
  )
}
