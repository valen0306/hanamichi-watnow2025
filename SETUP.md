# Supabase 設定手順

## 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - anon/public key

## 2. 環境変数の設定

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の内容を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 認証設定

Supabase ダッシュボードで以下を設定：

1. **Authentication > Settings**でメール確認を無効化（開発環境の場合）
   - "Enable email confirmations" のチェックを外す
2. **Authentication > URL Configuration**でリダイレクト URL を設定：
   - `http://localhost:3000/auth/callback` (開発環境)
   - `https://yourdomain.com/auth/callback` (本番環境)

## 4. アプリケーションの起動

```bash
npm run dev
```

## 5. 使用方法

- `/auth` - ログイン/サインアップページ
- ログイン後は自動的にホームページにリダイレクト
- ナビゲーションバーからログアウト可能

## 注意事項

- 本番環境では適切なセキュリティ設定を行ってください
- パスワードポリシーやメールテンプレートは必要に応じてカスタマイズしてください
- 開発環境ではメール確認を無効化することで、すぐにテストできます
- 本番環境では必ずメール確認を有効化してセキュリティを確保してください
