import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const PostHeader = () => {
  return (
    <header className="post-header bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-center relative">
        <Link href="/timeline" className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="post-title text-xl font-semibold text-gray-800">新規投稿</h1>
      </div>
    </header>
  );
};

export default PostHeader;