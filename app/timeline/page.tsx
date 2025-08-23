import { SearchHeader } from "@/components/features/timeline/search_header"
import { PhotoGrid, type Photo } from "@/components/features/timeline/photo_grid"

export default function PhotoFeedPage() {
  const photos: Photo[] = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    src: `/placeholder.svg?height=300&width=300&query=photo ${i + 1}`,
    alt: `Photo ${i + 1}`,
  }))

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-shrink-0">
        
        <SearchHeader />
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        <PhotoGrid photos={photos} />
      </main>
    </div>
  )
}
