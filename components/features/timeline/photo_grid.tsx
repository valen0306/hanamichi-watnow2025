interface Photo {
    id: number
    src: string
    alt: string
  }
  
  interface PhotoGridProps {
    photos: Photo[]
  }
  
  export function PhotoGrid({ photos }: PhotoGridProps) {
    return (
      <div className="grid grid-cols-3 gap-px bg-gray-200">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square bg-white">
            <img
              src={photo.src || `/placeholder.svg?height=300&width=300&query=photo ${photo.id}`}
              alt={photo.alt}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    )
  }
  
  export type { Photo }
  