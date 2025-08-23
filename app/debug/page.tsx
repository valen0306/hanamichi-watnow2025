'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function DebugPage() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults((prev) => prev + message + '\n');
  };

  const clearResults = () => {
    setResults('');
  };

  const testEnvironmentVariables = () => {
    addResult('=== 環境変数チェック ===');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    addResult(`URL: ${url ? '設定済み' : '未設定'}`);
    addResult(`Key: ${key ? '設定済み' : '未設定'}`);

    if (url) {
      addResult(`URL詳細: ${url.substring(0, 30)}...`);
    }
    if (key) {
      addResult(`Key詳細: ${key.substring(0, 20)}...`);
    }
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    addResult('\n=== Supabase接続テスト ===');

    try {
      addResult('Supabaseクライアント作成中...');
      const supabase = createClient();
      addResult('クライアント作成完了');

      addResult('認証状態確認中...');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        addResult(`セッションエラー: ${sessionError.message}`);
      } else {
        addResult(`セッション状態: ${session ? 'ログイン済み' : '未ログイン'}`);
      }

      addResult('接続テスト完了');
    } catch (error) {
      addResult(
        `接続エラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    addResult('\n=== データベース接続テスト ===');

    try {
      const supabase = createClient();

      addResult('usersテーブル確認中...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        addResult(`データベースエラー: ${error.message}`);
        addResult(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        addResult('データベース接続成功');
        addResult(`結果: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(
        `データベース接続エラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testSimpleAuth = async () => {
    setLoading(true);
    addResult('\n=== 簡単な認証テスト ===');

    try {
      const supabase = createClient();

      addResult('サインアップテスト開始...');
      const startTime = Date.now();

      const { data, error } = await supabase.auth.signUp({
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      addResult(`処理時間: ${duration}ms`);

      if (error) {
        addResult(`認証エラー: ${error.message}`);
        addResult(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        addResult('認証成功');
        addResult(`結果: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(
        `認証テストエラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testNetworkConnection = async () => {
    setLoading(true);
    addResult('\n=== ネットワーク接続テスト ===');

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) {
        addResult('URLが設定されていません');
        return;
      }

      addResult(`Supabase URL: ${url}`);

      // 基本的なHTTP接続テスト
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      addResult(`HTTP接続時間: ${duration}ms`);
      addResult(`HTTPステータス: ${response.status}`);
      addResult(`HTTPステータステキスト: ${response.statusText}`);

      if (response.ok) {
        addResult('ネットワーク接続成功');
      } else {
        addResult('ネットワーク接続エラー');
      }
    } catch (error) {
      addResult(
        `ネットワークエラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('=== 全テスト開始 ===\n');

    testEnvironmentVariables();
    await testNetworkConnection();
    await testSupabaseConnection();
    await testDatabaseConnection();
    await testSimpleAuth();

    addResult('\n=== 全テスト完了 ===');
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase デバッグツール</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'テスト中...' : '全テスト実行'}
        </button>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded ml-4"
        >
          結果クリア
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <button
          onClick={testEnvironmentVariables}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          環境変数チェック
        </button>

        <button
          onClick={testNetworkConnection}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded ml-4 disabled:opacity-50"
        >
          ネットワークテスト
        </button>

        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded ml-4 disabled:opacity-50"
        >
          Supabase接続テスト
        </button>

        <button
          onClick={testDatabaseConnection}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded ml-4 disabled:opacity-50"
        >
          データベーステスト
        </button>

        <button
          onClick={testSimpleAuth}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded ml-4 disabled:opacity-50"
        >
          認証テスト
        </button>
      </div>

      <div className="bg-black p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">テスト結果:</h2>
        <pre className="text-sm whitespace-pre-wrap bg-black p-4 rounded border">
          {results || 'テストを実行してください...'}
        </pre>
      </div>
    </div>
  );
}
