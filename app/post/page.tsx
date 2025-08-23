"use client";

import { uploadImageToPostImages, dataURLtoBlob, getPostImagePublicUrl } from "@/lib/strage";
import { createPostWithCaptionAndUserId, savePostImageInfo } from "@/lib/post";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect, useState } from "react";

// Camera components
import PostHeader from "@/components/features/camera/header";
import AddCommentBox from "@/components/features/camera/createcaptio";
import ShareButton from "@/components/features/camera/postbutton";
import ReClipButton from "@/components/features/camera/recripbotton";
import ClipButton from "@/components/features/camera/cripbottun";

const CameraPost: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [uploadError, setUploadError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isPosted, setIsPosted] = useState<boolean>(false);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("カメラの起動に失敗しました");
      }
    };
    startCamera();
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const imageData = canvasRef.current.toDataURL("image/png");
        setPhoto(imageData);
        // カメラ機能（ストリーム）を停止
        const stream = videoRef.current.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        // 位置情報取得
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            () => {
              setLocationError('位置情報の取得に失敗しました');
            }
          );
        } else {
          setLocationError("このデバイスは位置情報取得に対応していません");
        }
      }
    }
  };

  const handlePost = () => {
    console.log("handlePost called");
    // 投稿処理（API連携など）
    const upload = async () => {
      console.log("Uploading photo...");
      try {
         console.log("Photo data:", photo);
        if (!photo) return;
        const blob = dataURLtoBlob(photo);
        const fileName = `post_${Date.now()}.png`;
        console.log("Uploading to Supabase with filename:", fileName);
        const url = await uploadImageToPostImages(blob, fileName);
          console.log("Upload result URL:", url);
        if (url) {
          // 投稿データ保存
          if (!user?.id) {
            setUploadError("ユーザーIDが取得できませんでした。ログインしてください。");
            return;
          }
          const post = await createPostWithCaptionAndUserId(comment, user.id);
          if (post && location) {
            // 2. 画像情報保存
            const success = await savePostImageInfo(url, location.lat, location.lng, post.id);
            if (success) {
              console.log("投稿と画像情報の保存に成功しました");
              // 投稿完了後、タイムラインに遷移
              router.push("/timeline");
            } else {
              setUploadError("画像情報の保存に失敗しました");
            }
          } else {
            setUploadError("投稿データの保存に失敗しました");
          }
          console.log("画像アップロード成功:", url);
          setUploadError("");
        } else {
          setUploadError("アップロード失敗: Supabaseストレージへの保存に失敗しました");
          console.error("画像アップロード失敗: Supabaseストレージへの保存に失敗しました");
        }
        setIsPosted(true);
      } catch (err) {
        setUploadError("アップロード失敗: " + (err instanceof Error ? err.message : String(err)));
        console.error("画像アップロード失敗", err);
      }
    };
    upload();
  };

  useEffect(() => {
    if (isPosted) {
      // 投稿完了後、初期状態に戻して再度カメラ起動
      setPhoto(null);
      setComment("");
      setIsPosted(false);
      setLocation(null);
      setLocationError("");
      setUploadError("");
      // カメラ再起動
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          alert("カメラの起動に失敗しました");
        }
      };
      startCamera();
    }
  }, [isPosted]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PostHeader />
      
      {!photo && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-md">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-lg shadow-lg mb-6" 
            />
            <div className="flex justify-center">
              <ClipButton onClick={takePhoto} />
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: "none" }} />
      
      {photo && !isPosted && (
        <div className="flex flex-col items-center px-4 pb-20">
          <div className="w-full max-w-md">
            {/* 撮影した写真 */}
            <div className="relative mb-6">
              <img 
                src={photo} 
                alt="撮影画像" 
                className="w-full rounded-lg shadow-lg" 
              />
              {/* 位置情報を写真下部中央に表示 */}
              {(location || locationError) && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
                  {location
                    ? `位置情報: 緯度 ${location.lat.toFixed(6)}, 経度 ${location.lng.toFixed(6)}`
                    : locationError}
                </div>
              )}
            </div>
            
            {/* コメント入力 */}
            <div className="mb-6">
              <AddCommentBox 
                value={comment}
                onChange={setComment}
                placeholder="コメントを入力してください"
              />
            </div>
            
            {/* ボタン群 */}
            <div className="flex flex-col gap-4 items-center">
              <ShareButton 
                onClick={handlePost} 
                disabled={!comment.trim()} 
              />
              <ReClipButton onClick={() => window.location.reload()} />
            </div>
            
            {/* エラーメッセージ */}
            {uploadError && (
              <div className="text-red-500 text-center mt-4 p-3 bg-red-50 rounded-lg">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}
      
      {isPosted && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">投稿完了！</h2>
            <p className="text-gray-600">写真の投稿が正常に完了しました</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPost;
