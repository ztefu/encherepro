import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Uploads a file to the Supabase 'public_assets' bucket.
 * Validates file type (MIME) and size before uploading.
 * @param file The File object to upload
 * @param folderName Optional folder name (e.g. 'logos', 'lots')
 * @returns The public URL of the uploaded file, or null if it failed.
 */
export async function uploadFileToSupabase(file: File, folderName: string = 'misc'): Promise<string | null> {
  // Validate file size (Correction #9)
  if (file.size > MAX_FILE_SIZE) {
    console.error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
    return null;
  }

  // Validate MIME type — do NOT rely on file extension alone (Correction #9)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    return null;
  }

  const supabase = createClient();
  try {
    // Derive extension from MIME type (more reliable than file.name)
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };
    const fileExtension = mimeToExt[file.type] || 'bin';
    const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // Upload the file to the 'public_assets' bucket
    const { data, error } = await supabase.storage
      .from('public_assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type, // Explicitly set content type
      });

    if (error) {
      console.error('Error uploading file to Supabase:', error.message);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('public_assets')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error during file upload');
    return null;
  }
}
