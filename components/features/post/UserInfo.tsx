'use client';

interface UserInfoProps {
  username: string;
  className?: string;
}

export function UserInfo({ username, className = '' }: UserInfoProps) {
  return (
    <div className={`flex items-center px-4 py-3 border-b border-gray-100 ${className}`}>
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
        <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
      </div>
      <span className="text-black font-medium">{username}</span>
    </div>
  );
}
