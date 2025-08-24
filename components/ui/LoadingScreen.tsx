'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  minDuration?: number; // 最小表示時間（ミリ秒）
}

export function LoadingScreen({ isVisible, onComplete, minDuration = 2000 }: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      // 最小表示時間後に非表示にする
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, minDuration);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible, minDuration, onComplete]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        
        {/* シンプルな1つの円形回転 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-80 h-80 animate-spin" style={{ animationDuration: '8s' }}>
            {/* 花8個 - 円形に配置 */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180); // 45度ずつ配置
              const radius = 120; // 半径
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={`flower-${i}`}
                  className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <Image
                    src="/flower.png"
                    alt="花"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ローディングテキスト */}
        <div className="absolute bottom-1/6 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h2 className="text-3xl font-bold animate-pulse" style={{ color: '#F7A5BF' }}>投稿中...</h2>
          </div>
        </div>
      </div>
    </div>
  );
}