import React from 'react';

// ボタンが受け取るpropsの型を定義します。
interface ClipButtonProps {
  onClick?: () => void;
  className?: string;
}

const ClipButton: React.FC<ClipButtonProps> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      className={`clip-button ${className || ''}`}
      onClick={onClick}
    >
      クリップ
    </button>
  );
};

export default ClipButton;