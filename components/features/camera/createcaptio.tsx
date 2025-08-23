import React, { useState } from 'react';

const AddCommentBox: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="relative w-[373px] h-[224.58px] rounded-lg shadow-md bg-white p-4"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      style={{
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* 灰色の点線ボーダー */}
      <div
        className="absolute inset-[10px] border-2 border-dashed border-gray-400 rounded-md"
        style={{ pointerEvents: 'none' }}
      ></div>

      {/* 「コメントを追加」のテキスト */}
      <div
        className={`absolute top-4 left-4 text-gray-400 pointer-events-none transition-opacity duration-300 ${isFocused ? 'opacity-0' : 'opacity-100'}`}
      >
        コメントを追加
      </div>

      {/* 新しくテキストを表示するエリア */}
      {isFocused && (
        <textarea
          className="absolute inset-[10px] w-[calc(100%-20px)] h-[calc(100%-20px)] p-2 text-black bg-transparent border-none focus:outline-none resize-none"
        />
      )}
    </div>
  );
};

export default AddCommentBox;