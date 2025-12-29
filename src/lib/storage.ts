import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  fileName: string;
}

/**
 * Upload a single file to Cloud storage
 */
export async function uploadToStorage(file: File): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `proofs/${fileName}`;

  const { error } = await supabase.storage
    .from('proof-images')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('proof-images')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Upload multiple files with progress callback
 */
export async function uploadMultipleToStorage(
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.({
      current: i + 1,
      total: files.length,
      fileName: file.name,
    });

    const result = await uploadToStorage(file);
    results.push(result);
  }

  return results;
}
