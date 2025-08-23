export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UpdateUserData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Post {
  id : string;
  user_id: string;
  updated_at: string;
  created_at: string;
  caption: string;
} 

export interface CreatePostData {
  user_id: string;
  caption: string;
}
export interface UpdatePostData {
  caption: string;
}