'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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

interface MapWithPinsProps {
  userLocation: Location;
  nearbyPosts: NearbyPost[];
}


const MapWithPins: React.FC<MapWithPinsProps> = ({ userLocation, nearbyPosts }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Google Maps APIの読み込み
    const loadGoogleMaps = () => {
      // 既に読み込み済みの場合
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // layout.tsxでスクリプトが読み込まれている場合は待機
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initializeMap();
          }
        }, 100);
        return;
      }

      // フォールバック: スクリプトが存在しない場合のみ新しく読み込み
      console.warn('Google Maps APIスクリプトが見つかりません。layout.tsxでの読み込みを確認してください。');
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      // デバッグ: 利用可能なAPIクラスを確認
      console.log('Google Maps API classes:', {
        maps: window.google.maps,
        Marker: window.google.maps.Marker,
        // AdvancedMarkerElementが利用可能かチェック
        hasAdvancedMarker: 'marker' in window.google.maps && 'AdvancedMarkerElement' in (window.google.maps as any).marker
      });

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMapInstance(map);
      setMapLoaded(true);
    };

    loadGoogleMaps();

    return () => {
      // クリーンアップ
      if (window.google && window.google.maps) {
        // マーカーを削除
        markers.forEach(marker => marker.setMap(null));
      }
    };
  }, [userLocation, mapLoaded]); // markersを依存関係から削除

  // 投稿のピンを表示
  useEffect(() => {
    if (!mapInstance || !nearbyPosts.length || !window.google || !window.google.maps) return;

    console.log('マーカー作成開始:', {
      mapInstance: !!mapInstance,
      nearbyPostsCount: nearbyPosts.length,
      userLocation,
      googleMapsAvailable: !!(window.google && window.google.maps)
    });

    // 既存のマーカーを削除（前回のマーカーをクリーンアップ）
    setMarkers(prevMarkers => {
      console.log('既存マーカー削除:', prevMarkers.length);
      prevMarkers.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (error) {
          console.warn('マーカー削除エラー:', error);
        }
      });
      return [];
    });

    const newMarkers: any[] = [];

    // 非推奨警告を抑制するためのヘルパー関数
    const createMarker = (options: any) => {
      console.log('マーカー作成オプション:', options);
      
      // AdvancedMarkerElementが利用可能な場合は使用
      if ('marker' in window.google.maps && 'AdvancedMarkerElement' in (window.google.maps as any).marker) {
        try {
          console.log('AdvancedMarkerElementを使用してマーカーを作成');
          const marker = new (window.google.maps as any).marker.AdvancedMarkerElement(options);
          console.log('AdvancedMarkerElement作成成功:', marker);
          return marker;
        } catch (error) {
          console.warn('AdvancedMarkerElementの作成に失敗しました。従来のMarkerを使用します:', error);
        }
      }
      
      // フォールバック: 従来のMarkerを使用
      try {
        console.log('従来のMarkerを使用してマーカーを作成');
        const marker = new window.google.maps.Marker(options);
        console.log('従来のMarker作成成功:', marker);
        return marker;
      } catch (error) {
        console.error('マーカー作成に失敗:', error);
        
        // 最終フォールバック: シンプルなデフォルトマーカー
        try {
          console.log('シンプルなデフォルトマーカーを作成');
          const simpleOptions = {
            position: options.position,
            map: options.map,
            title: options.title
          };
          const marker = new window.google.maps.Marker(simpleOptions);
          console.log('シンプルなデフォルトマーカー作成成功:', marker);
          return marker;
        } catch (fallbackError) {
          console.error('フォールバックマーカー作成も失敗:', fallbackError);
          return null;
        }
      }
    };

    // ユーザーの現在位置にマーカー
    console.log('ユーザーマーカー作成開始');
    const userMarker = createMarker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map: mapInstance,
      title: '現在地',
      label: {
        text: '現在地',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      }
    });

    if (userMarker) {
      console.log('ユーザーマーカー作成成功:', userMarker);
      newMarkers.push(userMarker);
    } else {
      console.error('ユーザーマーカーの作成に失敗');
    }

    // 投稿のピンを表示
    console.log('投稿マーカー作成開始');
    nearbyPosts.forEach((post, index) => {
      console.log(`投稿${index + 1}のマーカー作成:`, post);
      
      const marker = createMarker({
        position: { lat: post.latitude, lng: post.longitude },
        map: mapInstance,
        title: `投稿 #${post.post_id}`,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold'
        },
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C6.12 0 3 3.12 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.88-3.12-7-7-7z" fill="#EA4335"/>
              <circle cx="10" cy="7" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(20, 20),
          anchor: new window.google.maps.Point(10, 20)
        }
      });

      if (marker) {
        console.log(`投稿${index + 1}マーカー作成成功:`, marker);

        // 情報ウィンドウを作成
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: bold;">
                投稿 #${post.post_id}
              </h3>
              <div style="margin-bottom: 8px;">
                <strong>距離:</strong> ${post.distance.toFixed(0)}m
              </div>
              <div style="margin-bottom: 8px;">
                <strong>緯度:</strong> ${post.latitude.toFixed(6)}<br>
                <strong>経度:</strong> ${post.longitude.toFixed(6)}
              </div>
              <div style="font-size: 12px; color: #666;">
                投稿日時: ${new Date(post.created_at).toLocaleString('ja-JP')}
              </div>
            </div>
          `
        });

        // マーカークリックで情報ウィンドウを表示
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        newMarkers.push(marker);
      } else {
        console.error(`投稿${index + 1}マーカーの作成に失敗`);
      }
    });

    console.log('作成されたマーカー数:', newMarkers.length);
    setMarkers(newMarkers);

    // マーカーの表示状態を確認
    setTimeout(() => {
      console.log('マーカー表示状態確認:');
      newMarkers.forEach((marker, index) => {
        try {
          const isVisible = marker.getMap ? marker.getMap() === mapInstance : marker.map === mapInstance;
          const position = marker.getPosition ? marker.getPosition() : marker.position;
          console.log(`マーカー${index + 1}:`, {
            visible: isVisible,
            position: position,
            map: marker.getMap ? marker.getMap() : marker.map,
            targetMap: mapInstance
          });
        } catch (error) {
          console.warn(`マーカー${index + 1}の状態確認エラー:`, error);
        }
      });
    }, 1000);

    // すべてのマーカーが表示されるように地図の範囲を調整
    if (newMarkers.length > 1) {
      console.log('地図の範囲調整開始');
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker, index) => {
        try {
          const position = marker.getPosition ? marker.getPosition() : marker.position;
          console.log(`マーカー${index + 1}の位置:`, position);
          bounds.extend(position);
        } catch (error) {
          console.warn(`マーカー${index + 1}の位置取得エラー:`, error);
        }
      });
      
      console.log('地図範囲調整:', bounds.toString());
      mapInstance.fitBounds(bounds);
      
      // 最小ズームレベルを設定
      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 15) {
          mapInstance.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }

  }, [mapInstance, nearbyPosts, userLocation]); // markersを依存関係から削除

  return (
    <div className="w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
      
      {!mapLoaded && (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center absolute inset-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWithPins; 