'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthInput } from '@/components/ui/AuthInput';
import { ButterflyVideo } from '@/components/ui/ButterflyVideo';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const router = useRouter();

  // ログイン状態を確認
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User is already logged in, redirecting to timeline...');
      router.push('/timeline');
    }
  }, [user, authLoading, router]);

  // 認証中は何も表示しない
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500">認証状態を確認中...</div>
        </div>
      </div>
    );
  }

  // 既にログインしている場合は何も表示しない
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let result;
      
      if (isSignUp) {
        // サインアップ時のバリデーション
        if (!username.trim()) {
          setError('ユーザー名を入力してください');
          setLoading(false);
          return;
        }
        
        result = await signUp(email, password, username.trim());
        if (!result.error) {
          setMessage('アカウントが作成されました！自動的にログインされます。');
          // サインアップ成功後、すぐにタイムラインにリダイレクト
          router.push('/timeline');
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) {
          // ログイン成功後、タイムラインにリダイレクト
          router.push('/timeline');
          return;
        }
      }

      if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error('Auth process error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
    setUsername('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴエリア */}
        <div className="text-center">
          {/* hanamichiロゴ画像 */}
          <div className="w-48 h-16 relative mx-auto mb-8">
            <Image
              src="/hanamichi-logo.png"
              alt="hanamichi"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <AuthInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="username" className="sr-only">
                  ユーザー名
                </label>
                <AuthInput
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <AuthInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm text-center">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 border border-[#000000]/54 rounded-lg text-sm font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#FEF4F4] text-[#000000]/54 hover:bg-[#FEF4F4]/80 focus:outline-none focus:ring-2 focus:ring-[#000000]/54'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#000000]/54 border-t-transparent rounded-full animate-spin mr-2"></div>
                  処理中...
                </div>
              ) : (
                isSignUp ? 'アカウント作成' : 'ログイン'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#000000]/54 hover:text-[#000000]/70 text-sm transition-colors duration-200"
            >
              {isSignUp ? '既にアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでない方はこちら'}
            </button>
            
            {/* 蝶の動画を配置 */}
            <div className="mt-4 w-full overflow-hidden">
              <ButterflyVideo />
            </div>
            
            {/* 花の装飾を配置 */}
            <div className="mt-6 flex justify-center space-x-20">
              <Image
                src="/flower.png"
                alt="花"
                width={36}
                height={36}
                className="opacity-60"
              />
              <Image
                src="/flower.png"
                alt="花"
                width={36}
                height={36}
                className="opacity-60"
              />
              <Image
                src="/flower.png"
                alt="花"
                width={36}
                height={36}
                className="opacity-60"
              />
              <Image
                src="/flower.png"
                alt="花"
                width={36}
                height={36}
                className="opacity-60"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
