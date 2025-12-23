import prisma from '../../../lib/db';

// API route: GET /api/dashboard
export async function GET() {
  // Example: return dashboard metrics
  const totalStudents = await prisma.student.count();
  const emailsSentToday = await prisma.emailQueue.count({
    where: {
      status: 'sent',
      sent_at: {
        gte: new Date(new Date().setHours(0,0,0,0)),
      },
    },
  });
  const emailsPending = await prisma.emailQueue.count({ where: { status: 'pending' } });
  const emailsFailed = await prisma.emailQueue.count({ where: { status: 'failed' } });
  const lastCron = await prisma.systemLog.findFirst({
    where: { type: 'cron' },
    orderBy: { created_at: 'desc' },
  });
  return Response.json({
    totalStudents,
    emailsSentToday,
    emailsPending,
    emailsFailed,
    lastCronTime: lastCron?.created_at || null,
  });
}
