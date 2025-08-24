import React from 'react';

interface ShareButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#FEF4F4] text-[#8A8A8A] font-bold rounded-xl shadow-lg
                 w-[260px] h-[54px] flex items-center justify-center
                 transition-all duration-300 hover:bg-[#FEF4F4]/80 disabled:bg-[#FEF4F4]/50 disabled:cursor-not-allowed`}
    >
      <span className="text-xl">シェア</span>
    </button>
  );
};

export default ShareButton;