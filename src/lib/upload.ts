import { createClient } from '@/lib/supabase/client';

/**
 * Uploads a file to the Supabase 'public_assets' bucket.
 * @param file The File object to upload
 * @param folderName Optional folder name (e.g. 'logos', 'lots')
 * @returns The public URL of the uploaded file, or null if it failed.
 */
export async function uploadFileToSupabase(file: File, folderName: string = 'misc'): Promise<string | null> {
  const supabase = createClient();
  try {
    // Generate a unique file name to avoid collisions
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // Upload the file to the 'public_assets' bucket
    const { data, error } = await supabase.storage
      .from('public_assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file to Supabase:', error);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('public_assets')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return null;
  }
}
