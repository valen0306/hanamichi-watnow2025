import React from 'react';

// ボタンコンポーネントのProps型を定義
interface ReClipButtonProps {
  onClick?: () => void;
}

const ReClipButton: React.FC<ReClipButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 text-white font-bold rounded-xl shadow-lg
                 w-72 h-14 flex items-center justify-center
                 transition-all duration-300 hover:bg-gray-700 active:bg-gray-900
                 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
    >
      <span className="text-xl">Re:クリップ</span>
    </button>
  );
};

export default ReClipButton;