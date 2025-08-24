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
  image_url?: string; // 投稿画像のURL
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

      // 初期ズームレベルを投稿の距離に基づいて調整
      let initialZoom = 14; // デフォルトズームレベル
      
      if (nearbyPosts.length > 0) {
        const maxDistance = Math.max(...nearbyPosts.map(post => post.distance));
        console.log('初期化時の最大距離:', maxDistance, 'm');
        
        if (maxDistance <= 500) {
          // 500m以内の場合は詳細表示
          initialZoom = 16;
        } else if (maxDistance <= 2000) {
          // 2km以内の場合は中程度の詳細
          initialZoom = 15;
        } else if (maxDistance >= 10000) {
          // 10km以上の場合は広範囲表示
          initialZoom = 12;
        }
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: initialZoom, // 動的に計算されたズームレベル
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
      
      console.log('地図初期化完了:', {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: initialZoom,
        nearbyPostsCount: nearbyPosts.length,
        message: '地図の移動が有効化されました'
      });
    };

    loadGoogleMaps();

    return () => {
      // クリーンアップ
      if (window.google && window.google.maps) {
        // マーカーを削除
        markers.forEach(marker => marker.setMap(null));
      }
    };
  }, [userLocation, mapLoaded, nearbyPosts]); // markersを依存関係から削除

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
    
    // カスタムユーザーマーカーのHTML要素を作成
    const userMarkerElement = document.createElement('div');
    userMarkerElement.innerHTML = `
      <div style="
        position: relative;
        width: 60px;
        height: 60px;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <!-- ユーザーアイコン -->
        <div style="
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4285F4, #34A853);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
          </svg>
        </div>
        
        <!-- ピンの矢印部分 -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #4285F4;
          z-index: 1;
        "></div>
        
        <!-- 現在地ラベル -->
        <div style="
          position: absolute;
          top: -5px;
          right: -5px;
          background: #EA4335;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: bold;
          border: 2px solid white;
          z-index: 3;
        ">
          現在
        </div>
      </div>
    `;
    
    const userMarker = createMarker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map: mapInstance,
      title: '現在地',
      content: userMarkerElement,
      // ピンの矢印部分が正確な位置を指すようにアンカーポイントを調整
      anchor: { x: 30, y: 60 } // ピンの中心（30px）と矢印の先端（60px）
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
      
      // カスタムピンのHTML要素を作成
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          position: relative;
          width: 60px;
          height: 60px;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">
          <!-- 投稿画像 -->
          <div style="
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
          ">
            <img 
              src="${post.image_url || 'https://via.placeholder.com/50x50/EA4335/FFFFFF?text=No+Image'}" 
              alt="投稿画像"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
              onerror="this.src='https://via.placeholder.com/50x50/EA4335/FFFFFF?text=Error'"
            />
          </div>
          
          <!-- ピンの矢印部分 -->
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid #EA4335;
            z-index: 1;
          "></div>
          
          <!-- 投稿番号ラベル -->
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            background: #4285F4;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid white;
            z-index: 3;
          ">
            ${index + 1}
          </div>
        </div>
      `;
      
      const marker = createMarker({
        position: { lat: post.latitude, lng: post.longitude },
        map: mapInstance,
        title: `投稿 #${post.post_id}`,
        content: markerElement,
        // ピンの矢印部分が正確な位置を指すようにアンカーポイントを調整
        anchor: { x: 30, y: 60 } // ピンの中心（30px）と矢印の先端（60px）
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
            targetMap: mapInstance,
            markerType: marker.constructor.name
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
      
      // ユーザー位置と投稿マーカーの位置を境界に追加
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
      
      // 投稿の距離に基づいて適切なパディングを計算
      let padding = 50; // デフォルトパディング
      
      // 近い投稿（1km以内）が多い場合はパディングを小さく
      // 遠い投稿（5km以上）がある場合はパディングを大きく
      if (nearbyPosts.length > 0) {
        const maxDistance = Math.max(...nearbyPosts.map(post => post.distance));
        console.log('最大距離:', maxDistance, 'm');
        
        if (maxDistance <= 1000) {
          // 1km以内の場合は小さなパディング
          padding = 30;
          console.log('近距離投稿のため、パディングを30pxに設定');
        } else if (maxDistance >= 5000) {
          // 5km以上の場合は大きなパディング
          padding = 80;
          console.log('遠距離投稿のため、パディングを80pxに設定');
        }
      }
      
      // 境界にパディングを追加して、マーカーが端に寄りすぎないようにする
      const paddingOptions = {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding
      };
      
      // 地図の範囲を設定
      mapInstance.fitBounds(bounds, paddingOptions);
      
      // 適切なズームレベルを設定
      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        const currentZoom = mapInstance.getZoom();
        console.log('現在のズームレベル:', currentZoom);
        
        // ズームレベルの調整
        let targetZoom = currentZoom;
        
        if (currentZoom > 18) {
          // ズームしすぎている場合は調整
          targetZoom = 18;
          console.log('ズームレベルを18に調整');
        } else if (currentZoom < 12) {
          // ズームが足りない場合は調整
          targetZoom = 12;
          console.log('ズームレベルを12に調整');
        }
        
        // 必要に応じてズームレベルを設定
        if (targetZoom !== currentZoom) {
          mapInstance.setZoom(targetZoom);
        }
        
        // リスナーを削除
        window.google.maps.event.removeListener(listener);
        
        console.log('最終的なズームレベル:', targetZoom);
        console.log('地図範囲調整完了');
      });
    } else if (newMarkers.length === 1) {
      // マーカーが1つの場合（ユーザー位置のみ）
      console.log('マーカーが1つの場合の処理');
      const userPosition = newMarkers[0].getPosition ? newMarkers[0].getPosition() : newMarkers[0].position;
      
      // ユーザー位置を中心に、適切なズームレベルで表示
      mapInstance.setCenter(userPosition);
      mapInstance.setZoom(15);
      
      console.log('ユーザー位置中心で地図を表示（ズームレベル15）');
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