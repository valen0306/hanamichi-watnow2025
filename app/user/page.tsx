'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/user';
import ProfileHeaderInfo from '@/components/features/profile/ProfileHeaderInfo';

export default function UserProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user || !user.id) {
        setError('ユーザーが認証されていません');
        setLoading(false);
        return;
      }

      console.log('ユーザープロフィール取得開始:', { userId: user.id });

      const userProfile = await getUserProfile(user.id);

      if (userProfile && userProfile.username) {
        setUsername(userProfile.username);
        console.log('ユーザープロフィール取得成功:', userProfile.username);
      } else {
        console.log('ユーザープロフィールが設定されていません');
        setUsername('user');
      }
    } catch (err) {
      console.error('ユーザープロフィール取得エラー:', err);
      setError('プロフィールの取得に失敗しました');
      setUsername('user');
    } finally {
      setLoading(false);
    }
  };

  // 認証チェック
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#FEF4F4] border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-medium text-[#000000]/54">プロフィール</h1>
        </div>
      </header>

      {/* Profile Content */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Profile Header Info */}
          <ProfileHeaderInfo username={username} />

          {/* Profile Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-[#000000]/54 mb-4">設定</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-[#000000]/54">
                プロフィール編集
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-[#000000]/54">
                プライバシー設定
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-[#000000]/54">
                通知設定
              </button>
              <button 
                onClick={() => router.push('/auth')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
