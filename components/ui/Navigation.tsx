'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const { user, profile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-[#FEF4F4] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-32 h-8 relative">
                <Image
                  src="/hanamichi-logo.png"
                  alt="hanamichi"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#FEF4F4] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/timeline" className="w-32 h-8 relative">
              <Image
                src="/hanamichi-logo.png"
                alt="hanamichi"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  ようこそ、{profile?.username || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-[#FFBAC4] hover:bg-[#FFBAC4]/80 text-[#000000]/54 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-[#FFBAC4] hover:bg-[#FFBAC4]/80 text-[#000000]/54 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
