'use client'

import { Timeline } from "@/components/features/timeline/Timeline"
import { SearchBar } from "@/components/features/timeline/SearchBar"

export default function TimelinePage() {
  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // ここで検索処理を実装
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header with Search */}
      <header className="sticky top-0 z-50 bg-white">
        <SearchBar onSearch={handleSearch} />
      </header>

      {/* Main Content - Timeline */}
      <main className="pb-20">
        <Timeline />
      </main>
    </div>
  )
}
