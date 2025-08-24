interface ProfileHeaderInfoProps {
  username: string;
}

export default function ProfileHeaderInfo({ username }: ProfileHeaderInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-500 rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-[#000000]/54 mb-2">{username}</h2>
        <p className="text-gray-500 text-sm">ユーザー</p>
      </div>
      
      <div className="flex items-center justify-center pt-4 space-x-8">
        <div className="text-center">
          <div className="text-xl font-bold text-[#000000]/54">0</div>
          <div className="text-sm text-gray-500">投稿</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#000000]/54">0</div>
          <div className="text-sm text-gray-500">フォロワー</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#000000]/54">0</div>
          <div className="text-sm text-gray-500">フォロー中</div>
        </div>
      </div>
    </div>
  );
}