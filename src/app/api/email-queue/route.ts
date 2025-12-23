import prisma from '../../../lib/db';

// API route: GET /api/email-queue
export async function GET(request: Request) {
  // Parse query params for filters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const emailType = searchParams.get('email_type') || undefined;
  const matricNumber = searchParams.get('matric_number') || undefined;
  const dateFrom = searchParams.get('date_from') ? new Date(searchParams.get('date_from')!) : undefined;
  const dateTo = searchParams.get('date_to') ? new Date(searchParams.get('date_to')!) : undefined;

  const where: any = {};
  if (status) where.status = status;
  // If filtering for cancelled, include those too
  // (no-op, as cancelled is a valid status in the DB)
  if (emailType) where.email_type = emailType;
  if (matricNumber) where.matric_number = matricNumber;
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at.gte = dateFrom;
    if (dateTo) where.created_at.lte = dateTo;
  }

  const queue = await prisma.emailQueue.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: { Student: true },
  });

  return Response.json(queue);
}
