import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Only initialize Supabase if both env vars are set and not empty
export const supabase =
  supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== ''
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  }
  return supabase;
}

export async function uploadPDF(file: File, storagePath: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(storagePath, file);
  if (error) throw error;
  return data;
}

export async function getPDFUrl(storagePath: string) {
  const supabase = requireSupabase();
  const { data } = supabase.storage.from('pdfs').getPublicUrl(storagePath);
  return data.publicUrl;
}
