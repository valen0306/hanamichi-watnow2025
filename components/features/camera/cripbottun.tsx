import React from 'react';

// Propsの型を定義（オプションでonClickとclassNameを受け取る）
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