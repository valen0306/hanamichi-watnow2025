import React, { useRef, useEffect, useState } from "react";

const CameraPost: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isPosted, setIsPosted] = useState<boolean>(false);

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
      }
    }
  };

  const handlePost = () => {
    // 投稿処理（API連携など）
    setIsPosted(true);
    alert("投稿が完了しました！");
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
        <div>
          <h3>撮影した写真</h3>
          <img src={photo} alt="撮影画像" style={{ width: "100%" }} />
          <div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="コメントを入力してください"
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <button onClick={handlePost} disabled={!comment}>投稿</button>
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
