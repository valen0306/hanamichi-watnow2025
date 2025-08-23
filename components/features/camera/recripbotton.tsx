import React from 'react';

// ボタンコンポーネントのProps型を定義
interface ReClipButtonProps {
  onClick?: () => void;
}

const ReClipButton: React.FC<ReClipButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#F5F5F5] text-[#7A7A7A] font-bold rounded-xl shadow-lg
                 w-[260px] h-[54px] flex items-center justify-center
                 transition-all duration-300 hover:bg-[#F0F0F0] active:bg-[#EBEBEB]
                 focus:outline-none focus:ring-2 focus:ring-[#7A7A7A] focus:ring-opacity-50"
    >
      <span className="text-xl">再撮影</span>
    </button>
  );
};

export default ReClipButton;