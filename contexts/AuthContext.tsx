'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { UserProfile, createUserProfile, getUserProfile } from '@/lib/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // ユーザープロフィールを取得（遅延実行）
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      // プロフィール取得は非同期で実行し、タイムアウトしない
      const userProfile = await getUserProfile(userId);
      
      if (userProfile) {
        console.log('Profile fetched successfully:', userProfile);
        setProfile(userProfile);
      } else {
        console.warn('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // 初期セッションでユーザーが存在する場合、プロフィールを取得
        if (session?.user) {
          console.log('Initial session found, fetching profile...');
          // 少し待ってからプロフィール取得を実行
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 500);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        
        // 認証成功後、プロフィールを取得
        if (session?.user) {
          console.log('User authenticated, fetching profile...');
          // 少し待ってからプロフィール取得を実行
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 500);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // ログイン成功後、プロフィールを取得
      console.log('Sign in successful, fetching user profile...');
      
      return { error: null };
    } catch (error) {
      return { error: 'ログイン中にエラーが発生しました' };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Starting sign up process for:', email, username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username, // メタデータにusernameを保存
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error: error.message };
      }

      console.log('Sign up successful, user data:', data);

      // サインアップ成功後、プロフィールを作成
      if (data.user) {
        console.log('Creating user profile for user ID:', data.user.id);
        
        try {
          const profileData = {
            id: data.user.id,
            username,
            email: data.user.email!,
            full_name: '',
            avatar_url: '',
          };

          console.log('Profile data to create:', profileData);

          const createdProfile = await createUserProfile(profileData);
          if (createdProfile) {
            console.log('User profile created successfully:', createdProfile);
            setProfile(createdProfile);
          } else {
            console.error('Failed to create user profile');
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
          // プロフィール作成に失敗しても認証は成功とする
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { error: 'アカウント作成中にエラーが発生しました' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
