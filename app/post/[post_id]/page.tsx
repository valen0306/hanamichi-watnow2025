'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserInfo } from '@/components/features/post/UserInfo';
import { PostContent } from '@/components/features/post/PostContent';
import { getUserProfile } from '@/lib/user';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PostData {
  id: string;
  caption: string;
  user_id: string;
  created_at: string;
}

interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  created_at: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.post_id as string;
  
  const [postData, setPostData] = useState<PostData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (postId && user) {
      fetchPostData(postId);
      fetchLikesData(postId);
    }
  }, [postId, user]);

  // postDataが取得された後にusernameを取得
  useEffect(() => {
    if (postData) {
      fetchUsername();
    }
  }, [postData]);

  const fetchPostData = async (id: string) => {
    try {
      setLoading(true);
      
      // postsテーブルから投稿データを取得
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) {
        console.error('投稿データ取得エラー:', postError);
        setError('投稿データの取得に失敗しました');
        return;
      }

      setPostData(postData);
      setCaption(postData.caption || '');

      // post_imagesテーブルから画像URLを取得
      const { data: imageData, error: imageError } = await supabase
        .from('post_images')
        .select('*')
        .eq('post_id', id)
        .single();

      if (imageError) {
        console.error('画像データ取得エラー:', imageError);
        setError('画像データの取得に失敗しました');
        return;
      }

      setImageUrl(imageData.image_url);
      
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsername = async () => {
    try {
      if (!postData) {
        console.log('投稿データがまだ取得されていません');
        return;
      }

      console.log('投稿者のusername取得開始:', { postUserId: postData.user_id });

      // 投稿者のuser_idを使ってuser_profilesテーブルからusernameを取得
      const userProfile = await getUserProfile(postData.user_id);

      if (userProfile && userProfile.username) {
        setUsername(userProfile.username);
        console.log('投稿者のusername取得成功:', userProfile.username);
      } else {
        console.log('投稿者のusernameが設定されていません');
        setUsername('unknown_user');
      }
      
    } catch (err) {
      console.error('投稿者のusername取得エラー:', err);
      if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        console.error('エラースタック:', err.stack);
      }
      setUsername('unknown_user');
    }
  };

  const fetchLikesData = async (id: string) => {
    try {
      if (!user || !user.id) {
        console.log('ユーザーが認証されていません');
        return;
      }

      console.log('いいねデータ取得開始（モック）:', { postId: id, userId: user.id });

      // モックデータでいいね数を設定
      const mockLikesCount = Math.floor(Math.random() * 10) + 1; // 1-10のランダムな数
      const mockIsLiked = Math.random() > 0.5; // 50%の確率でいいね済み
      
      setLikesCount(mockLikesCount);
      setIsLiked(mockIsLiked);
      
      console.log('モックいいね状態設定完了:', { 
        totalLikes: mockLikesCount, 
        isLiked: mockIsLiked 
      });
      
    } catch (err) {
      console.error('モックいいねデータ取得エラー:', err);
      if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        console.error('エラースタック:', err.stack);
      }
    }
  };

  const handleLike = async () => {
    if (!user || !user.id) {
      console.error('ユーザーが認証されていません');
      return;
    }

    try {
      if (isLiked) {
        console.log('いいね削除を試行中（モック）:', { postId, userId: user.id });
        
        // モックでいいねを削除
        await new Promise(resolve => setTimeout(resolve, 100)); // 100msの遅延をシミュレート
        
        console.log('モックいいね削除成功');
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1)); // 0未満にならないように
        
      } else {
        console.log('いいね追加を試行中（モック）:', { postId, userId: user.id });
        
        // モックでいいねを追加
        await new Promise(resolve => setTimeout(resolve, 100)); // 100msの遅延をシミュレート
        
        console.log('モックいいね追加成功');
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('モックいいね処理エラー:', err);
      if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        console.error('エラースタック:', err.stack);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/timeline');
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
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-0">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          
          <h1 className="text-lg font-medium text-black">発見</h1>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      </header>

      {/* Fixed Content Container */}
      <div className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-white">
        {/* User Info - Headerと隙間なく接着 */}
        <UserInfo username={username} className="border-t-0 -mt-px" />
        
        {/* Scrollable Content */}
        <PostContent
          imageUrl={imageUrl}
          likesCount={likesCount}
          isLiked={isLiked}
          commentsCount={commentsCount}
          username={username}
          caption={caption}
          onLike={handleLike}
          className="h-[calc(100vh-8rem)] overflow-y-auto"
        />
      </div>
    </div>
  );
}
