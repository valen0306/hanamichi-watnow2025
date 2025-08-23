import { createClient } from './supabase';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// ユーザープロフィールを作成
export async function createUserProfile(
  userData: CreateUserProfileData
): Promise<UserProfile | null> {
  const supabase = createClient();
  
  console.log('Creating user profile:', userData);

  try {
    // まず、テーブルの存在確認
    console.log('Checking if user_profiles table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table access error:', {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code,
      });
      return null;
    }

    console.log('Table access successful, proceeding with insert...');

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        error: error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        errorString: error ? error.toString() : 'null',
        errorMessage: error?.message || 'No message',
        errorDetails: error?.details || 'No details',
        errorHint: error?.hint || 'No hint',
        errorCode: error?.code || 'No code',
      });
      
      // エラーオブジェクトの詳細をログ出力
      if (error) {
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
      
      return null;
    }

    console.log('User profile created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return null;
  }
}

// ユーザープロフィールを取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  
  console.log('Fetching user profile for ID:', userId);

  try {
    // タイムアウト処理を追加
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout (25 seconds)')), 25000); // 25秒でタイムアウト
    });

    const queryPromise = (async () => {
      console.log('Executing database query for user ID:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Database query completed. Data:', data, 'Error:', error);

      if (error) {
        console.error('Supabase error details:', {
          error: error,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : [],
          errorString: error ? error.toString() : 'null',
          errorMessage: error?.message || 'No message',
          errorDetails: error?.details || 'No details',
          errorHint: error?.hint || 'No hint',
          errorCode: error?.code || 'No code',
        });
        
        // エラーオブジェクトの詳細をログ出力
        if (error) {
          console.error('Full error object:', JSON.stringify(error, null, 2));
        }
        
        return null;
      }

      console.log('Successfully retrieved user profile:', data);
      return data;
    })();

    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return null;
  }
}

// ユーザープロフィールを更新
export async function updateUserProfile(
  userId: string,
  updates: Partial<CreateUserProfileData>
): Promise<UserProfile | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return null;
  }
}

// データベースの状態を確認するヘルパー関数
export async function checkDatabaseStatus(): Promise<void> {
  const supabase = createClient();
  
  try {
    console.log('=== Database Status Check ===');
    
    // 現在の認証状態を確認
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current auth session:', session ? 'exists' : 'none');
    if (session) {
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
    }
    
    // user_profilesテーブルの存在確認とスキーマ確認
    console.log('Checking user_profiles table...');
    
    // タイムアウト付きでテーブルアクセスをテスト
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Table access timeout')), 10000);
    });
    
    const tableCheckPromise = (async () => {
      const { data: tables, error: tablesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      return { tables, tablesError };
    })();
    
    const { tables, tablesError } = await Promise.race([tableCheckPromise, timeoutPromise]);
    
    if (tablesError) {
      console.error('user_profiles table access error:', {
        message: tablesError.message,
        details: tablesError.details,
        hint: tablesError.hint,
        code: tablesError.code,
        fullError: tablesError,
      });
      
      // エラーコードに基づいて問題を特定
      if (tablesError.code === 'PGRST116') {
        console.error('Table does not exist or access denied');
      } else if (tablesError.code === '42501') {
        console.error('Permission denied - RLS policy issue');
      } else if (tablesError.code === '42P01') {
        console.error('Table does not exist');
      }
    } else {
      console.log('user_profiles table accessible');
      console.log('Sample data:', tables);
    }
    
    console.log('=== End Database Status Check ===');
    
  } catch (error) {
    console.error('Database check failed:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Database check timed out - this suggests a connection issue');
    }
  }
}
