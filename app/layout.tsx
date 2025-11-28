import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import NavigationWrapper from '@/components/ui/NavigationWrapper';
import FooterWrapper from '@/components/ui/FooterWrapper';

const zenMaruGothic = Zen_Maru_Gothic({
  variable: '--font-zen-maru-gothic',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Hanamichi WatNow 2025',
  description: '花道の今を共有するアプリ',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WatNow',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/pwa-icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa_icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WatNow" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* Google Maps API - 一度だけ読み込み */}
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly`}
          async
          defer
        />
      </head>
      <body
        className={`${zenMaruGothic.variable} antialiased`}
      >
        <AuthProvider>
          <NavigationWrapper />
          <main className="min-h-screen pb-20 pt-16">
            {children}
          </main>
          <FooterWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}