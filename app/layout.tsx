import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hanamichi WatNow 2025',
  description: '花道の今を共有するアプリ',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 環境変数をチェック
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const shouldLoadGoogleMaps = googleMapsApiKey && googleMapsApiKey !== 'undefined' && googleMapsApiKey.trim() !== '';
  
  // デバッグ用ログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Google Maps API 環境変数チェック:', {
      apiKey: googleMapsApiKey,
      apiKeyType: typeof googleMapsApiKey,
      shouldLoad: shouldLoadGoogleMaps,
      isUndefined: googleMapsApiKey === 'undefined',
      isEmpty: googleMapsApiKey === '',
      trimmed: googleMapsApiKey?.trim()
    });
  }
  
  return (
    <html lang="ja">
      <head>
        
        {/* Google Maps API - 環境変数が正しく設定されている場合のみ読み込み */}
        {shouldLoadGoogleMaps ? (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
            async
            defer
          />
        ) : (
          // 開発環境でのみ警告を表示
          process.env.NODE_ENV === 'development' && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  console.warn('Google Maps API キーが設定されていません。');
                  console.warn('地図機能を使用するには、.env.local ファイルに以下を設定してください：');
                  console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here');
                `
              }}
            />
          )
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen pb-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}