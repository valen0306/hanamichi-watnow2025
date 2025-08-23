import React, { useState } from 'react';

interface AddCommentBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AddCommentBox: React.FC<AddCommentBoxProps> = ({ value, onChange, placeholder = "コメントを追加" }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="relative w-full h-[224.58px] rounded-lg shadow-md bg-[#FEF4F4] p-4"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      style={{
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* 点線ボーダー */}
      <div
        className="absolute inset-[10px] border-2 border-dashed border-[#8A8A8A] rounded-md"
        style={{ pointerEvents: 'none' }}
      ></div>

      {/* 「コメントを追加」のテキスト */}
      <div
        className={`absolute top-4 left-4 text-[#8A8A8A] pointer-events-none transition-opacity duration-300 ${isFocused || value ? 'opacity-0' : 'opacity-100'}`}
      >
        {placeholder}
      </div>

      {/* テキストエリア */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-[10px] w-[calc(100%-20px)] h-[calc(100%-20px)] p-2 text-black bg-transparent border-none focus:outline-none resize-none"
        placeholder=""
      />
    </div>
  );
};

export default AddCommentBox;