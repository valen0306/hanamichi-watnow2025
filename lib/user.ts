import { createClient } from './supabase';
import { User, CreateUserData, UpdateUserData } from '@/types/database';

export async function createUser(
  userData: CreateUserData
): Promise<User | null> {
  const supabase = createClient();

  console.log('createUser called with:', userData);

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });
      return null;
    }

    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in createUser:', error);
    return null;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

export async function updateUser(
  userId: string,
  updates: UpdateUserData
): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from('users').delete().eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
}
