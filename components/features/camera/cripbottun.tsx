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
      onClick={onClick}
      className={`bg-[#FEF4F4] text-[#8A8A8A] font-bold rounded-xl shadow-lg
                 w-[260px] h-[54px] flex items-center justify-center
                 transition-all duration-300 hover:bg-[#FEF4F4]/80 active:bg-[#FEF4F4]/90
                 focus:outline-none focus:ring-2 focus:ring-[#8A8A8A] focus:ring-opacity-50 ${className || ''}`}
    >
      <span className="text-xl">撮影</span>
    </button>
  );
};

export default ClipButton;