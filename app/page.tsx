import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">WatNowへようこそ</h1>
          <p className="mt-4 text-gray-600">
            ログインしてアプリケーションを利用してください。
          </p>
        </div>
      </main>
    </div>
  );
}
