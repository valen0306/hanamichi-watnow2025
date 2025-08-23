"use client";

import { uploadImageToPostImages, dataURLtoBlob } from "@/lib/strage";


import React, { useRef, useEffect, useState } from "react";

const CameraPost: React.FC = () => {
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
            (pos) => {
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLocationError("");
            },
            (err) => {
              setLocationError("位置情報の取得に失敗しました");
            },
            { enableHighAccuracy: true }
          );
        } else {
          setLocationError("このデバイスは位置情報取得に対応していません");
        }
      }
    }
  };

  const handlePost = () => {
    // 投稿処理（API連携など）
    const upload = async () => {
      if (!photo) return;
      const blob = dataURLtoBlob(photo);
      const fileName = `post_${Date.now()}.png`;
      const url = await uploadImageToPostImages(blob, fileName);
      if (url) {
        // ここでurlをDB保存などに利用可能
        alert("画像アップロード成功: " + url);
      } else {
        alert("投稿完了");
      }
      setIsPosted(true);
    };
    upload();
  };

  return (
    <div>
      {!photo && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
          <button onClick={takePhoto}>撮影</button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photo && !isPosted && (
        <div style={{ position: "relative" }}>
          <h3>撮影した写真</h3>
          <div style={{ position: "relative", width: "100%" }}>
            <img src={photo} alt="撮影画像" style={{ width: "100%" }} />
            {/* 位置情報を写真下部中央に表示 */}
            {(location || locationError) && (
              <div style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.95em"
              }}>
                {location
                  ? `位置情報: 緯度 ${location.lat.toFixed(6)}, 経度 ${location.lng.toFixed(6)}`
                  : locationError}
              </div>
            )}
          </div>
          <div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="コメントを入力してください"
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled={!comment} onClick={() => { console.log('投稿ボタンが押下できました'); }}>投稿</button>
            <button onClick={() => window.location.reload()}>再撮影</button>
          </div>
        </div>
      )}
      {isPosted && (
        <div>
          <p>投稿が完了しました！</p>
        </div>
      )}
    </div>
  );
};

export default CameraPost;
