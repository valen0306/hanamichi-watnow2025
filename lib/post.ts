/**
 * post_imagesテーブルに写真のURL・緯度・経度・post_idを保存する関数
 * @param imageUrl 画像の公開URL
 * @param lat 緯度
 * @param lng 経度
 * @param postId 投稿ID
 * @returns 保存結果（true:成功, false:失敗）
 */
export async function savePostImageInfo(imageUrl: string, lat: number, lng: number, postId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('post_images')
    .insert([{ image_url: imageUrl, latitude: lat, longitude: lng, post_id: postId }]);
  if (error) {
    console.error('Error saving post image info:', error);
    return false;
  }
  return true;
}
/**
 * captionとuser_idを取得してpostテーブルに保存する関数
 * @param caption 投稿の本文
 * @param userId 投稿者のID
 * @returns 作成されたPostデータ or null
 */
export async function createPostWithCaptionAndUserId(caption: string, userId: string): Promise<Post | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .insert([{ caption, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }
  return data;
}
import { createClient } from './supabase';
import { Post, CreatePostData, UpdatePostData } from '@/types/database';

export async function createPost(
  postData: CreatePostData
): Promise<Post | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  return data;
}

export async function getPost(postId: string): Promise<Post | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

export async function updatePost(
  postId: string,
  updates: UpdatePostData
): Promise<Post | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  return data;
}

export async function deletePost(postId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}