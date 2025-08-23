'use client';

import React, { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function MapPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [watchId, setWatchId] = useState<number | null>(null);

  // 現在地を1回取得
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('このブラウザは位置情報取得に対応していません');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(newLocation);
        setLoading(false);
        console.log('位置情報取得成功:', newLocation);
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の権限が拒否されました。ブラウザの設定で位置情報を許可してください。';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。';
            break;
          default:
            errorMessage = `位置情報エラー: ${error.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
        console.error('位置情報取得エラー:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 位置情報の監視を開始
  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('このブラウザは位置情報取得に対応していません');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(newLocation);
        console.log('位置情報更新:', newLocation);
      },
      (error) => {
        let errorMessage = '位置情報の監視に失敗しました';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の権限が拒否されました。';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。';
            break;
          default:
            errorMessage = `位置情報エラー: ${error.message}`;
        }
        
        setError(errorMessage);
        console.error('位置情報監視エラー:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    setWatchId(id);
  };

  // 位置情報の監視を停止
  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // 位置情報をクリップボードにコピー
  const copyToClipboard = () => {
    if (location) {
      const text = `緯度: ${location.latitude}, 経度: ${location.longitude}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('位置情報をクリップボードにコピーしました！');
      }).catch(() => {
        alert('クリップボードへのコピーに失敗しました');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            位置情報取得
          </h1>

          {/* 操作ボタン */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? '取得中...' : '現在地を取得'}
            </button>
            
            {!watchId ? (
              <button
                onClick={startWatching}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                位置情報を監視開始
              </button>
            ) : (
              <button
                onClick={stopWatching}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                監視停止
              </button>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>エラー:</strong> {error}
            </div>
          )}

          {/* 位置情報表示 */}
          {location && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                現在の位置情報
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    緯度 (Latitude)
                  </label>
                  <p className="text-lg font-mono text-gray-800">
                    {location.latitude.toFixed(8)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    経度 (Longitude)
                  </label>
                  <p className="text-lg font-mono text-gray-800">
                    {location.longitude.toFixed(8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    精度 (Accuracy)
                  </label>
                  <p className="text-lg font-mono text-gray-800">
                    {location.accuracy.toFixed(2)} メートル
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    取得時刻
                  </label>
                  <p className="text-lg font-mono text-gray-800">
                    {new Date(location.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>

              {/* コピーボタン */}
              <div className="text-center">
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  位置情報をコピー
                </button>
              </div>

              {/* 監視状態表示 */}
              {watchId && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    位置情報を監視中...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 使用方法の説明 */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              使用方法
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>現在地を取得:</strong> 現在の位置情報を1回取得します</li>
              <li>• <strong>位置情報を監視開始:</strong> 位置情報の変更をリアルタイムで監視します</li>
              <li>• <strong>監視停止:</strong> 位置情報の監視を停止します</li>
              <li>• <strong>位置情報をコピー:</strong> 緯度・経度をクリップボードにコピーします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}