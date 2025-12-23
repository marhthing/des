import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// API route: GET /api/dashboard
export async function GET() {
  // Get total students
  const { count: totalStudents } = await supabase
    .from('Student')
    .select('*', { count: 'exact', head: true });

  // Emails sent today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: emailsSentToday } = await supabase
    .from('EmailQueue')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', today.toISOString())
    .eq('status', 'sent');

  // Emails pending
  const { count: emailsPending } = await supabase
    .from('EmailQueue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Emails failed
  const { count: emailsFailed } = await supabase
    .from('EmailQueue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  // Last cron execution
  const { data: lastCronRows } = await supabase
    .from('SystemLog')
    .select('created_at')
    .eq('type', 'cron')
    .order('created_at', { ascending: false })
    .limit(1);
  const lastCronTime = lastCronRows && lastCronRows.length > 0 ? lastCronRows[0].created_at : null;

  return Response.json({
    totalStudents: totalStudents ?? 0,
    emailsSentToday: emailsSentToday ?? 0,
    emailsPending: emailsPending ?? 0,
    emailsFailed: emailsFailed ?? 0,
    lastCronTime,
  });
}
