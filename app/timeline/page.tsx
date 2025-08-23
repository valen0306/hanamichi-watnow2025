import { Search } from "lucide-react"
import { Timeline } from "@/components/features/timeline/Timeline"
import { SearchHeader } from "@/components/features/timeline/SearchHeader"

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="検索"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Timeline */}
      <main className="pb-20">
        <Timeline />
      </main>
    </div>
  )
}
