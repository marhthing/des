import prisma from '../../../lib/db';

export async function GET() {
  const files = await prisma.uploadedFile.findMany({
    include: { Student: { select: { student_name: true } } },
    orderBy: { uploaded_at: 'desc' },
  });
  return Response.json(files);
}
