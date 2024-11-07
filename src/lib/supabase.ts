import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvdydwufwigdrhzwhkvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZHlkd3Vmd2lnZHJoendoa3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTE4NzIsImV4cCI6MjA0NTc2Nzg3Mn0.eF1Ynmv2ICRVWDlsi2CpY9zAHIeTTPGl8Ea7mNsWFmo';

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'car-images';

export const getUserStoragePath = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

export const uploadImage = async (file: File): Promise<string> => {
  const userId = await getUserStoragePath();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
};

export const deleteImage = async (url: string): Promise<void> => {
  const userId = await getUserStoragePath();
  
  // Extract filename from URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

export const cleanupUserStorage = async (): Promise<void> => {
  try {
    const userId = await getUserStoragePath();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const filesToDelete = data.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete);

      if (deleteError) {
        throw deleteError;
      }
    }
  } catch (error) {
    console.error('Failed to cleanup user storage:', error);
  }
};