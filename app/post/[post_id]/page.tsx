'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

// Supabaseクライアントをシングルトンとして管理
let supabaseClient: any = null;

const getSupabaseClient = async () => {
  if (!supabaseClient) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.post_id as string;
  
  const [imageUrl, setImageUrl] = useState<string>('');
  const [username, setUsername] = useState<string>('匿名ユーザー');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [commentsCount, setCommentsCount] = useState<number>(3); // テストデータ
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (postId) {
      console.log('取得したpost_id:', postId);
      fetchPostData(postId);
      fetchLikesData(postId);
    }
  }, [postId]);

  // いいねデータを取得
  const fetchLikesData = async (id: string) => {
    try {
      // 現在のユーザーIDを取得（テスト用に固定値を使用）
      // 実際の実装では認証システムから取得
      const testUserId = '3341a2b8-cefc-4597-8437-c665f5bd6835'; // 既存のユーザーIDを使用
      setCurrentUserId(testUserId);
      console.log('現在のユーザーID:', testUserId);
      
      // Supabaseクライアントの取得
      const supabase = await getSupabaseClient();
      
      // post_likesテーブルからいいね情報を取得
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', id);
      
      console.log('post_likes取得結果:', { likesData, likesError });
      
      if (likesError) {
        console.error('いいねデータ取得エラー:', likesError);
        // エラーが発生した場合、デフォルト値を設定
        setLikesCount(0);
        setIsLiked(false);
        return;
      }
      
      // いいね数を設定
      const totalLikes = likesData?.length || 0;
      setLikesCount(totalLikes);
      console.log('総いいね数:', totalLikes);
      
      // 現在のユーザーがいいねしているかチェック
      // post_likesテーブルのuser_idは、その投稿にいいねを押したユーザーのID
      const userLiked = likesData?.some((like: any) => like.user_id === testUserId) || false;
      setIsLiked(userLiked);
      console.log('現在のユーザーがいいね済み:', userLiked);
      
      // デバッグ用：各いいねの詳細をログ出力
      if (likesData && likesData.length > 0) {
        console.log('いいね詳細:', likesData.map((like: any) => ({
          post_id: like.post_id,
          user_id: like.user_id, // いいねを押したユーザーのID
          created_at: like.created_at
        })));
      }
      
    } catch (err) {
      console.error('いいねデータ取得エラー:', err);
      // エラーが発生した場合、デフォルト値を設定
      setLikesCount(0);
      setIsLiked(false);
    }
  };

  // いいねボタンのクリック処理
  const handleLikeClick = async () => {
    // 既にいいね済みの場合は何もしない
    if (isLiked) {
      console.log('既にいいね済みです - ボタンは無効化されています');
      return;
    }
    
    try {
      console.log('いいねボタンがクリックされました');
      console.log('投稿ID:', postId, 'ユーザーID:', currentUserId);
      
      // Supabaseクライアントの取得
      const supabase = await getSupabaseClient();
      
      // 重複チェック：既にいいねしているか確認
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
        console.error('重複チェックエラー:', checkError);
        return;
      }
      
      if (existingLike) {
        console.log('既にいいね済みです（重複チェック）');
        setIsLiked(true);
        return;
      }
      
      // post_likesテーブルに新しいいいねを追加
      // user_idは、いいねを押したユーザー（現在ログインしているユーザー）のID
      console.log('いいね追加を試行中:', {
        post_id: postId,
        user_id: currentUserId, // いいねを押したユーザーのID
        created_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('post_likes')
        .insert([
          {
            post_id: postId,
            user_id: currentUserId, // いいねを押したユーザーのID
            created_at: new Date().toISOString()
          }
        ]);
      
      console.log('いいね追加結果:', { data, error });
      
      if (error) {
        // 409 Conflictエラーの場合、既にいいね済みとして扱う
        if (error.code === '23505') { // unique_violation
          console.log('既にいいね済みです（unique constraint violation）');
          // データベースの状態を再取得してUIを同期
          await fetchLikesData(postId);
          return;
        }
        
        console.error('いいね追加エラーの詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }
      
      console.log('いいねが正常に追加されました:', data);
      
      // UIを更新
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      console.log('いいね状態が更新されました - isLiked:', true, 'likesCount:', likesCount + 1);
      
    } catch (err) {
      console.error('いいね処理エラー:', err);
      // エラーが発生した場合、データベースの状態を再取得してUIを同期
      await fetchLikesData(postId);
    }
  };

  // コメントボタンのクリック処理
  const handleCommentClick = () => {
    setShowCommentBox(!showCommentBox);
    console.log('コメントボタンがクリックされました, 表示状態:', !showCommentBox);
  };

  const fetchPostData = async (id: string) => {
    try {
      setLoading(true);
      console.log('投稿データ取得開始:', id);
      
      // Supabaseクライアントの取得
      const supabase = await getSupabaseClient();
      console.log('Supabaseクライアント作成完了');
      
      // post_imagesテーブルとpostsテーブルを結合して投稿データを取得
      const { data, error } = await supabase
        .from('post_images')
        .select(`
          post_id,
          image_url,
          posts!inner(
            id,
            user_id
          )
        `)
        .eq('post_id', id)
        .single();
      
      console.log('Supabaseクエリ結果:', { data, error });
      
      if (error) {
        throw new Error(`投稿データの取得に失敗しました: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error('投稿が見つかりません');
      }
      
      console.log('取得した投稿データ:', data);
      setImageUrl(data.image_url);
      
      // user_idを取得
      const userId = (data.posts as any)?.user_id;
      console.log('取得したuser_id:', userId);
      
      if (userId) {
        // user_profilesテーブルからユーザー情報を取得
        const { data: userProfile, error: userError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', userId)
          .single();
        
        console.log('user_profiles取得結果:', { userProfile, userError });
        
        if (userProfile && !userError) {
          console.log('取得したユーザー名:', userProfile.username);
          setUsername(userProfile.username || '匿名ユーザー');
        } else {
          console.log('ユーザー情報が取得できませんでした');
          setUsername('匿名ユーザー');
        }
      }
      
    } catch (err) {
      console.error('投稿データ取得エラー:', err);
      setError(err instanceof Error ? err.message : '投稿データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">画像を読み込み中...</p>
          <p className="text-sm text-gray-500 mt-2">post_id: {postId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-lg font-bold mb-2">エラー</h2>
          <p>{error}</p>
          <p className="text-sm mt-2">post_id: {postId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 画像表示 */}
        {imageUrl && (
          <div className="bg-white overflow-hidden">
            {/* 投稿者情報（画像の上） */}
            <div className="p-4 pb-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-800">投稿者: {username}</p>
                  <p className="text-sm text-gray-500">投稿ID: {postId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">現在のユーザーID</p>
                  <p className="text-xs text-gray-500 font-mono">{currentUserId}</p>
                  <p className={`text-xs ${isLiked ? 'text-pink-600' : 'text-gray-500'}`}>
                    {isLiked ? '✓ いいね済み' : '○ いいね未済'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 画像 */}
            <img 
              src={imageUrl} 
              alt={`投稿 ${postId} の画像`}
              className="w-full h-auto max-h-96 object-contain"
              onError={(e) => {
                console.log('画像読み込みエラー:', imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* いいね・コメントボタン */}
            <div className="p-4 flex items-center space-x-6">
              {/* いいねボタン */}
              <button 
                onClick={handleLikeClick}
                disabled={isLiked}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  isLiked 
                    ? 'text-pink-500 cursor-not-allowed opacity-75' 
                    : 'text-gray-600 hover:text-pink-500 hover:scale-105'
                }`}
                title={isLiked ? '既にいいね済みです' : 'いいねする'}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isLiked 
                    ? 'bg-pink-200 shadow-md ring-2 ring-pink-300' 
                    : 'bg-white border-2 border-gray-300 hover:border-pink-300'
                }`}>
                  <span className={`text-lg ${
                    isLiked ? 'text-pink-600' : 'text-gray-400'
                  }`}>♥</span>
                </div>
                <span className={`font-medium ${
                  isLiked ? 'text-pink-500' : 'text-gray-500'
                }`}>
                  {isLiked ? 'いいね済み' : likesCount}
                </span>
              </button>
              
              {/* コメントボタン */}
              <button 
                onClick={handleCommentClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-105"
                title="コメントを表示/非表示"
              >
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-300">
                  <span className="text-gray-400 text-lg">💬</span>
                </div>
                <span className="text-gray-500 font-medium">{commentsCount}</span>
              </button>
            </div>
            
            {/* コメント入力欄 */}
            {showCommentBox && (
              <div className="px-4 pb-4">
                <textarea
                  placeholder="コメントを入力してください..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
