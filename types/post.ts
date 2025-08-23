export interface Post {
  id: string
  userId: string
  username: string
  userAvatar?: string
  content: string
  images?: string[]
  createdAt: Date
  likes: number
  comments: number
  isLiked?: boolean
}

export interface CreatePostData {
  content: string
  images?: File[]
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

export interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  userAvatar?: string
  content: string
  createdAt: Date
}

export interface PostStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
}
