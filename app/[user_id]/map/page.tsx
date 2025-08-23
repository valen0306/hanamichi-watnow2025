'use client';

import React, { useState, useEffect } from 'react';
import MapWithPins from '../../components/MapWithPins';

interface Location {
  latitude: number;
  longitude: number;
}

interface NearbyPost {
  post_id: string;
  latitude: number;
  longitude: number;
  distance: number;
  created_at: string;
}

export default function UserMapPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [nearbyPosts, setNearbyPosts] = useState<NearbyPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string>('');

  // 現在地を取得
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('このブラウザは位置情報取得に対応していません');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(newLocation);
        setLoading(false);
        
        // 位置情報が取得できたら近い投稿を検索
        if (newLocation) {
          fetchNearbyPosts(newLocation);
        }
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の権限が拒否されました';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }, []);

  // 現在地に近い投稿を取得
  const fetchNearbyPosts = async (userLocation: Location) => {
    setLoadingPosts(true);
    setSupabaseError('');
    
    try {
      // 環境変数の確認
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('環境変数チェック:', { 
        supabaseUrl: supabaseUrl ? '設定済み' : '未設定', 
        supabaseKey: supabaseKey ? '設定済み' : '未設定' 
      });
      
      if (!supabaseUrl || !supabaseKey) {
        setSupabaseError('Supabaseの設定が不完全です。環境変数を確認してください。');
        setLoadingPosts(false);
        return;
      }

      // 動的にSupabaseクライアントを作成
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Supabaseクライアント作成完了');

      // まず、テーブルの存在確認
      console.log('post_imagesテーブルの存在確認中...');
      
      // 基本的なデータ取得を試行
      const { data: basicData, error: basicError } = await supabase
        .from('post_images')
        .select('*')
        .limit(1);
      
      console.log('基本的なデータ取得結果:', { basicData, basicError });
      
      if (basicError) {
        console.error('基本的なデータ取得エラー:', basicError);
        
        // エラーの詳細を分析
        if (basicError.message.includes('does not exist')) {
          setSupabaseError('post_imagesテーブルが存在しません。テーブル名を確認してください。');
        } else if (basicError.message.includes('permission')) {
          setSupabaseError('post_imagesテーブルへのアクセス権限がありません。');
        } else if (basicError.message.includes('RLS')) {
          setSupabaseError('Row Level Security (RLS)が有効で、アクセスが制限されています。');
        } else {
          setSupabaseError('テーブルアクセスエラー: ' + basicError.message);
        }
        
        setLoadingPosts(false);
        return;
      }

      // テーブルが存在するがデータがない場合
      if (!basicData || basicData.length === 0) {
        console.log('テーブルは存在しますが、データが0件です');
        
        // 他のテーブルの存在確認
        console.log('利用可能なテーブルを確認中...');
        
        // 一般的なテーブル名を試行
        const commonTableNames = ['posts', 'post', 'images', 'user_posts', 'user_images'];
        
        for (const tableName of commonTableNames) {
          try {
            const { data: testData, error: testError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            console.log(`テーブル ${tableName} の確認結果:`, { 
              exists: !testError, 
              dataCount: testData?.length || 0,
              error: testError?.message 
            });
            
            if (!testError && testData && testData.length > 0) {
              console.log(`テーブル ${tableName} にデータがあります！`);
              console.log(`サンプルデータ:`, testData[0]);
            }
          } catch (err) {
            console.log(`テーブル ${tableName} の確認中にエラー:`, err);
          }
        }
        
        setSupabaseError('post_imagesテーブルにデータが存在しません。データを挿入するか、正しいテーブル名を確認してください。');
        setLoadingPosts(false);
        return;
      }

      // post_imagesテーブルから投稿データを取得
      console.log('位置情報付きデータを取得中...');
      const { data, error } = await supabase
        .from('post_images')
        .select('post_id, latitude, longitude, created_at')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      console.log('位置情報付きデータ取得結果:', { data, error });
      console.log('取得したデータ:', data); // デバッグ用
      console.log('データ件数:', data?.length || 0); // データ件数
      console.log('現在地:', userLocation); // 現在地

      if (error) {
        console.error('投稿取得エラー:', error);
        setSupabaseError('投稿データの取得に失敗しました: ' + error.message);
        setLoadingPosts(false);
        return;
      }

      // データが空の場合の詳細確認
      if (!data || data.length === 0) {
        console.log('データが空です。テーブル構造を確認中...');
        
        // テーブル構造を確認
        const { data: tableInfo, error: tableError } = await supabase
          .from('post_images')
          .select('*');
        
        console.log('テーブル全体のデータ:', tableInfo);
        console.log('テーブル構造確認エラー:', tableError);
        
        if (tableInfo && tableInfo.length > 0) {
          console.log('テーブルにはデータがありますが、位置情報がnullの可能性があります');
          console.log('サンプルデータ:', tableInfo[0]);
        }
        
        setSupabaseError('位置情報付きの投稿データが見つかりません。データに緯度経度が設定されているか確認してください。');
        setLoadingPosts(false);
        return;
      }

      // 距離を計算して近い順にソート
      const postsWithDistance = (data || [])
        .map(post => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            post.latitude,
            post.longitude
          );
          console.log(`投稿 ${post.post_id}: 距離 ${distance.toFixed(0)}m`); // 各投稿の距離
          return {
            ...post,
            distance
          };
        })
        .filter(post => {
          const isWithinRange = post.distance <= 100000; // 100km以内
          console.log(`投稿 ${post.post_id}: 100km以内 ${isWithinRange ? '○' : '×'}`); // 範囲内かチェック
          return isWithinRange;
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // 上位10件

      console.log('フィルター後の投稿:', postsWithDistance); // フィルター後の結果
      console.log('最終表示件数:', postsWithDistance.length); // 最終表示件数

      setNearbyPosts(postsWithDistance);
    } catch (err) {
      console.error('投稿取得エラー:', err);
      setSupabaseError('投稿データの取得中にエラーが発生しました');
    } finally {
      setLoadingPosts(false);
    }
  };

  // 2点間の距離を計算（Haversine formula）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    const distanceM = distanceKm * 1000; // メートル単位で返す
    
    console.log(`距離計算: (${lat1}, ${lon1}) → (${lat2}, ${lon2}) = ${distanceM.toFixed(0)}m`);
    
    return distanceM;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">位置情報を取得中...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 現在の位置情報 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            現在の位置情報
          </h1>
          
          {location && (
            <div className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-blue-600 mb-2">
                    緯度 (Latitude)
                  </label>
                  <p className="text-2xl font-mono text-blue-800">
                    {location.latitude.toFixed(6)}
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-green-600 mb-2">
                    経度 (Longitude)
                  </label>
                  <p className="text-2xl font-mono text-green-800">
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  この位置情報はページ遷移時に自動で取得されました
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 近い投稿の表示 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            近くの投稿
          </h2>
          
          {/* Supabaseエラーの表示 */}
          {supabaseError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Supabaseエラー:</strong> {supabaseError}
            </div>
          )}
          
          {loadingPosts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">近くの投稿を検索中...</p>
            </div>
          ) : nearbyPosts.length > 0 ? (
            <>
              {/* 地図表示 */}
              <div className="mb-8">
                <MapWithPins 
                  userLocation={location!}
                  nearbyPosts={nearbyPosts}
                />
              </div>
              
              {/* 投稿リスト */}
              <div className="space-y-4">
                {nearbyPosts.map((post) => (
                  <div key={post.post_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        投稿 #{post.post_id}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {post.distance.toFixed(0)}m
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">緯度:</span> {post.latitude.toFixed(6)}
                      </div>
                      <div>
                        <span className="font-medium">経度:</span> {post.longitude.toFixed(6)}
                      </div>
                    </div>
                    
                    {post.created_at && (
                      <div className="mt-2 text-xs text-gray-500">
                        投稿日時: {new Date(post.created_at).toLocaleString('ja-JP')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">100km以内に投稿が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 