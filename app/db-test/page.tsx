'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function DbTestPage() {
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults((prev) => prev + message + '\n');
  };

  const clearResults = () => {
    setResults('');
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    clearResults();
    addResult('=== データベース接続テスト ===\n');

    try {
      const supabase = createClient();

      // 1. 基本的な接続テスト
      addResult('1. 基本的な接続テスト...');
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (testError) {
        addResult(`❌ 接続エラー: ${testError.message}`);
        addResult(`詳細: ${JSON.stringify(testError, null, 2)}`);
        return;
      }
      addResult('✅ 基本的な接続成功\n');

      // 2. usersテーブルの構造確認
      addResult('2. usersテーブルの構造確認...');
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })
        .catch(() => ({
          data: null,
          error: { message: 'RPC function not available' },
        }));

      if (columnsError) {
        addResult(`⚠️ テーブル構造確認エラー: ${columnsError.message}`);
        addResult('手動でSQL Editorで確認してください:');
        addResult(
          "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"
        );
      } else {
        addResult('✅ テーブル構造確認成功');
        addResult(`列情報: ${JSON.stringify(columns, null, 2)}`);
      }

      // 3. 既存のユーザーデータ確認
      addResult('\n3. 既存のユーザーデータ確認...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        addResult(`❌ ユーザーデータ取得エラー: ${usersError.message}`);
      } else {
        addResult(`✅ ユーザーデータ取得成功`);
        addResult(`件数: ${users?.length || 0}件`);
        if (users && users.length > 0) {
          addResult(`データ: ${JSON.stringify(users, null, 2)}`);
        }
      }
    } catch (error) {
      addResult(
        `❌ 予期しないエラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    addResult('\n=== createUser関数テスト ===\n');

    try {
      const supabase = createClient();

      // テスト用のユーザーデータ
      const testUserData = {
        id: 'test-user-id-' + Date.now(),
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        full_name: 'Test User',
        avatar_url: '',
      };

      addResult(
        `テストユーザーデータ: ${JSON.stringify(testUserData, null, 2)}\n`
      );

      // createUser関数を直接テスト
      const { data, error } = await supabase
        .from('users')
        .insert([testUserData])
        .select()
        .single();

      if (error) {
        addResult(`❌ createUserエラー: ${error.message}`);
        addResult(`詳細: ${JSON.stringify(error, null, 2)}`);

        // エラーの種類を分析
        if (error.message.includes('duplicate key')) {
          addResult('💡 重複キーエラー: 同じIDのユーザーが既に存在');
        } else if (error.message.includes('relation "users" does not exist')) {
          addResult('💡 テーブルが存在しません: スキーマを適用してください');
        } else if (error.message.includes('permission denied')) {
          addResult('💡 権限エラー: RLSポリシーを確認してください');
        }
      } else {
        addResult(`✅ createUser成功`);
        addResult(`作成されたユーザー: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(
        `❌ 予期しないエラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const checkAuthUsers = async () => {
    setLoading(true);
    addResult('\n=== auth.usersテーブル確認 ===\n');

    try {
      const supabase = createClient();

      // auth.usersテーブルの確認（管理者権限が必要な場合がある）
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .limit(5)
        .catch(() => ({
          data: null,
          error: { message: 'auth.users table access denied' },
        }));

      if (authError) {
        addResult(`⚠️ auth.users確認エラー: ${authError.message}`);
        addResult('これは正常です。auth.usersは通常直接アクセスできません。');
      } else {
        addResult(`✅ auth.users確認成功`);
        addResult(`件数: ${authUsers?.length || 0}件`);
        if (authUsers && authUsers.length > 0) {
          addResult(`データ: ${JSON.stringify(authUsers, null, 2)}`);
        }
      }
    } catch (error) {
      addResult(
        `❌ 予期しないエラー: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">データベーステスト</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testDatabaseConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'テスト中...' : 'データベース接続テスト'}
        </button>

        <button
          onClick={testCreateUser}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded ml-4 disabled:opacity-50"
        >
          {loading ? 'テスト中...' : 'createUser関数テスト'}
        </button>

        <button
          onClick={checkAuthUsers}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded ml-4 disabled:opacity-50"
        >
          {loading ? 'テスト中...' : 'auth.users確認'}
        </button>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded ml-4"
        >
          結果クリア
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">テスト結果:</h2>
        <pre className="text-sm whitespace-pre-wrap bg-white p-4 rounded border max-h-96 overflow-y-auto">
          {results || 'テストを実行してください...'}
        </pre>
      </div>
    </div>
  );
}
