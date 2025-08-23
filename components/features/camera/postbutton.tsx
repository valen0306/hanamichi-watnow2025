import React from 'react';

const ShareButton: React.FC = () => {
  return (
    <button
      className="bg-gray-800 text-white font-bold rounded-xl shadow-lg
                 w-[260px] h-[54px] flex items-center justify-center
                 transition-all duration-300 hover:bg-gray-700"
    >
      <span className="text-xl">シェア</span>
    </button>
  );
};

export default ShareButton;