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
