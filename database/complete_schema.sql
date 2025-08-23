-- ========================================
-- Supabase プロジェクト完全セットアップ
-- ========================================

-- 1. users テーブルの作成
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. posts テーブルの作成
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. post_images テーブルの作成
-- ========================================
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  embedded_im TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) の有効化
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

-- 5. users テーブルのポリシー
-- ========================================

-- ユーザーは自分のデータのみ読み取り可能
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 認証されたユーザーは自分のデータを作成可能
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- 6. posts テーブルのポリシー
-- ========================================

-- 全員が投稿を読み取り可能
CREATE POLICY "Posts are publicly viewable" ON posts
  FOR SELECT USING (true);

-- 認証されたユーザーは自分の投稿を作成可能
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ更新可能
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ削除可能
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 7. post_images テーブルのポリシー
-- ========================================

-- 全員が画像情報を読み取り可能
CREATE POLICY "Post images are publicly viewable" ON post_images
  FOR SELECT USING (true);

-- 認証されたユーザーは画像情報を作成可能
CREATE POLICY "Users can create post images" ON post_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_images.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- ユーザーは自分の投稿の画像のみ更新可能
CREATE POLICY "Users can update own post images" ON post_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_images.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- ユーザーは自分の投稿の画像のみ削除可能
CREATE POLICY "Users can delete own post images" ON post_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_images.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- 8. インデックスの作成
-- ========================================
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS post_images_post_id_idx ON post_images(post_id);

-- 9. トリガー関数の作成
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. トリガーの設定
-- ========================================
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. 確認クエリ
-- ========================================
-- テーブルの存在確認
SELECT 
  table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as exists
FROM (VALUES 
  ('users'),
  ('posts'),
  ('post_images')
) as t(table_name);

-- ポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
