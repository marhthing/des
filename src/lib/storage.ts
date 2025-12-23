import { createClient } from '@supabase/supabase-js';

// Supabase storage service (PDF upload/download)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadPDF(file: File, storagePath: string) {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(storagePath, file);
  if (error) throw error;
  return data;
}

export async function getPDFUrl(storagePath: string) {
  const { data } = supabase.storage.from('pdfs').getPublicUrl(storagePath);
  return data.publicUrl;
}
