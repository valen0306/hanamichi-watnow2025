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

      // 地図の移動を制限するためのCSSスタイルを適用
      if (mapRef.current) {
        const mapElement = mapRef.current.querySelector('.gm-style') || mapRef.current;
        if (mapElement) {
          (mapElement as HTMLElement).style.pointerEvents = 'none';
          console.log('地図の移動を無効化しました（CSSレベル）');
        }
      }

      // ズームコントロールのみ有効にする
      const zoomControls = mapRef.current?.querySelectorAll('.gm-control-active');
      if (zoomControls) {
        zoomControls.forEach(control => {
          (control as HTMLElement).style.pointerEvents = 'auto';
        });
        console.log('ズームコントロールは有効です');
      }

      // 地図の移動を制限するイベントリスナーを追加
      setTimeout(() => {
        // 地図要素の移動を制限
        const mapCanvas = mapRef.current?.querySelector('canvas');
        if (mapCanvas) {
          // マウスイベントを完全に無効化
          const mouseEvents = ['mousedown', 'mousemove', 'mouseup', 'click', 'dblclick'];
          mouseEvents.forEach(eventType => {
            mapCanvas.addEventListener(eventType, (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }, { capture: true, passive: false });
          });
          
          // タッチイベントを完全に無効化
          const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
          touchEvents.forEach(eventType => {
            mapCanvas.addEventListener(eventType, (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }, { capture: true, passive: false });
          });
          
          // キーボードイベントも無効化
          const keyEvents = ['keydown', 'keyup', 'keypress'];
          keyEvents.forEach(eventType => {
            mapCanvas.addEventListener(eventType, (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }, { capture: true, passive: false });
          });
          
          console.log('地図の移動を完全に無効化しました（JavaScriptレベル）');
        }
        
        // 地図コンテナ全体の移動も制限
        const mapContainer = mapRef.current?.querySelector('.gm-style');
        if (mapContainer) {
          const containerEvents = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'];
          containerEvents.forEach(eventType => {
            mapContainer.addEventListener(eventType, (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }, { capture: true, passive: false });
          });
          
          console.log('地図コンテナの移動も無効化しました');
        }
        
        // 地図全体の移動を防ぐための追加制限
        const allMapElements = mapRef.current?.querySelectorAll('*');
        if (allMapElements) {
          allMapElements.forEach(element => {
            if (element instanceof HTMLElement) {
              // 地図関連の要素のみ移動を制限
              if (element.className.includes('gm-') || element.tagName === 'CANVAS') {
                element.style.pointerEvents = 'none';
                element.style.userSelect = 'none';
                element.style.webkitUserSelect = 'none';
              }
            }
          });
          
          console.log('地図要素全体の移動を無効化しました');
        }
        
      }, 1000);

      setMapInstance(map);
      setMapLoaded(true);
      
      console.log('地図初期化完了:', {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: initialZoom,
        nearbyPostsCount: nearbyPosts.length
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
        style={{
          // 地図の移動を制限するCSSスタイル
          userSelect: 'none',
          WebkitUserSelect: 'none',
          // 地図の移動を完全に無効化
          overflow: 'hidden',
          position: 'relative'
        }}
      />
      
      {!mapLoaded && (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center absolute inset-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      )}
      
      {/* 地図移動制限の説明 */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>地図は固定されています</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ズーム機能は利用可能
        </div>
      </div>
      
      {/* 地図移動制限の警告 */}
      <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg shadow-md text-xs text-yellow-800">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          <span>移動不可</span>
        </div>
        <div className="text-xs text-yellow-600 mt-1">
          指で動かしても移動しません
        </div>
      </div>
    </div>
  );
};

export default MapWithPins; 