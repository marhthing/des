import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// GET /api/settings
export async function GET() {
  const { data: settings, error } = await supabase
    .from('SystemSettings')
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') {
    // PGRST116: No rows found
    return Response.json({ error: error.message }, { status: 500 });
  }
  // Provide sensible defaults if not found
  return Response.json(
    settings || {
      daily_email_limit: 100,
      sender_email: 'admin@sfgs.edu',
      email_interval_minutes: 2,
    }
  );
}

// POST /api/settings
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Upsert settings (id = 1)
  const { error } = await supabase
    .from('SystemSettings')
    .upsert({
      id: 1,
      daily_email_limit: body.daily_email_limit,
      sender_email: body.sender_email,
      email_interval_minutes: body.email_interval_minutes,
    });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
