import { createClient } from '@supabase/supabase-js';
import { logEvent, logError } from '../../../../lib/logging';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// API route: POST /api/cron/birthday
export async function POST(req: Request) {
  // Security: check for secret token
  const token = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('token');
  if (token !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();
    // Find students whose birthday is today (ignoring year)
    const { data: students, error: studentError } = await supabase
      .from('Student')
      .select('*')
      .filter('date_of_birth', 'gte', `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00.000Z`)
      .filter('date_of_birth', 'lt', `${year}-${month.toString().padStart(2, '0')}-${(day+1).toString().padStart(2, '0')}T00:00:00.000Z`);
    if (studentError) throw new Error(studentError.message);
    let count = 0;
    for (const student of students ?? []) {
      // Prevent duplicate birthday emails per student per day
      const { data: alreadyQueued, error: queueError } = await supabase
        .from('EmailQueue')
        .select('id')
        .eq('student_id', student.id)
        .eq('email_type', 'birthday')
        .gte('created_at', today.toISOString())
        .limit(1);
      if (queueError) throw new Error(queueError.message);
      if (!alreadyQueued || alreadyQueued.length === 0) {
        const emails = [student.parent_email_1, student.parent_email_2].filter(Boolean);
        for (const email of emails) {
          const { error: insertError } = await supabase
            .from('EmailQueue')
            .insert({
              student_id: student.id,
              matric_number: student.matric_number,
              recipient_email: email,
              email_type: 'birthday',
              status: 'pending',
            });
          if (insertError) throw new Error(insertError.message);
          count++;
        }
      }
    }
    await logEvent('cron', `Queued ${count} birthday emails`);
    return Response.json({ queued: count });
  } catch (error: any) {
    await logError('cron', error.message || 'Unknown error');
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
