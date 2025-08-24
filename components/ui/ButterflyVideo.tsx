'use client';

import { useEffect, useRef } from 'react';

interface ButterflyVideoProps {
  className?: string;
}

export const ButterflyVideo: React.FC<ButterflyVideoProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // 動画をループ再生
      video.loop = true;
      // 自動再生を試行
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Video autoplay failed:', error);
          // ユーザーインタラクション後に再生を試行
          const handleUserInteraction = () => {
            video.play().catch(console.error);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
          };
          document.addEventListener('click', handleUserInteraction);
          document.removeEventListener('click', handleUserInteraction);
          document.addEventListener('touchstart', handleUserInteraction);
        });
      }
    }
  }, []);

  return (
    <div className={`w-full pointer-events-none ${className}`}>
      <video
        ref={videoRef}
        className="w-16 h-16 object-contain animate-butterfly-fly"
        muted
        playsInline
        preload="auto"
      >
        <source src="/butterfly-video.mp4" type="video/mp4" />
        <source src="/butterfly-video.webm" type="video/webm" />
        お使いのブラウザは動画の再生に対応していません。
      </video>
    </div>
  );
};
