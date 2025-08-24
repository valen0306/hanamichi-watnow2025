'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  minDuration?: number; // 最小表示時間（ミリ秒）
}

export function LoadingScreenWithImages({ isVisible, onComplete, minDuration = 2000 }: LoadingScreenProps) {
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
        
        {/* 中央の回転する花たち */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* 大きな花 - ゆっくり回転 */}
          <div className="absolute -top-16 -left-16 w-32 h-32 animate-spin" style={{ animationDuration: '4s' }}>
            <Image
              src="/flower.png" // 添付いただいた花の画像
              alt="花"
              width={128}
              height={128}
              className="w-full h-full object-contain opacity-90"
            />
          </div>

          {/* 中サイズの花 - 反対回転 */}
          <div className="absolute top-8 -right-8 w-20 h-20 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
            <Image
              src="/flower.png" // 添付いただいた花の画像
              alt="花"
              width={80}
              height={80}
              className="w-full h-full object-contain opacity-80"
            />
          </div>

          {/* 小さな花 - 速い回転 */}
          <div className="absolute -bottom-4 left-4 w-16 h-16 animate-spin" style={{ animationDuration: '2s' }}>
            <Image
              src="/flower.png" // 添付いただいた花の画像
              alt="花"
              width={64}
              height={64}
              className="w-full h-full object-contain opacity-70"
            />
          </div>
        </div>

        {/* 横並びで順番に跳ねる蝶たち */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 flex space-x-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={`butterfly-${i}`}
              className="w-12 h-12 animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            >
              <Image
                src="/butterfly.png" // 添付いただいた蝶の画像
                alt="蝶"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* 画面四隅に配置された花たち - パルス */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 animate-pulse" style={{ animationDuration: '2s' }}>
          <Image
            src="/flower.png"
            alt="花"
            width={64}
            height={64}
            className="w-full h-full object-contain opacity-60"
          />
        </div>

        <div className="absolute top-1/4 right-1/4 w-16 h-16 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Image
            src="/flower.png"
            alt="花"
            width={64}
            height={64}
            className="w-full h-full object-contain opacity-60"
          />
        </div>

        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>
          <Image
            src="/flower.png"
            alt="花"
            width={64}
            height={64}
            className="w-full h-full object-contain opacity-60"
          />
        </div>

        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '1.5s' }}>
          <Image
            src="/flower.png"
            alt="花"
            width={64}
            height={64}
            className="w-full h-full object-contain opacity-60"
          />
        </div>

        {/* 飛び回る蝶たち */}
        <div className="absolute top-1/3 left-1/5 w-10 h-10 animate-ping" style={{ animationDuration: '1.5s' }}>
          <Image
            src="/butterfly.png"
            alt="蝶"
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute top-2/3 right-1/5 w-10 h-10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.7s' }}>
          <Image
            src="/butterfly.png"
            alt="蝶"
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>

        {/* ローディングテキスト */}
        <div className="absolute bottom-1/6 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-pink-600 mb-4 animate-pulse">投稿中...</h2>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
