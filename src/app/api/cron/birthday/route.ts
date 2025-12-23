import prisma from '../../../../lib/db';
import { logEvent, logError } from '../../../../lib/logging';

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
    // Find students whose birthday is today
    const students = await prisma.student.findMany({
      where: {
        date_of_birth: {
          gte: new Date(`${today.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00.000Z`),
          lt: new Date(`${today.getFullYear()}-${month.toString().padStart(2, '0')}-${(day+1).toString().padStart(2, '0')}T00:00:00.000Z`),
        },
      },
    });
    let count = 0;
    for (const student of students) {
      // Prevent duplicate birthday emails per student per day
      const alreadyQueued = await prisma.emailQueue.findFirst({
        where: {
          student_id: student.id,
          email_type: 'birthday',
          created_at: {
            gte: today,
          },
        },
      });
      if (!alreadyQueued) {
        const emails = [student.parent_email_1, student.parent_email_2].filter(Boolean);
        for (const email of emails) {
          await prisma.emailQueue.create({
            data: {
              student_id: student.id,
              matric_number: student.matric_number,
              recipient_email: email!,
              email_type: 'birthday',
              status: 'pending',
            },
          });
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
