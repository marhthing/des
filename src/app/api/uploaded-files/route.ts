import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  // Fetch uploaded files with student name (left join)
  const { data: files, error } = await supabase
    .from('UploadedFile')
    .select('*, Student(student_name)')
    .order('uploaded_at', { ascending: false });
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(files ?? []);
}
