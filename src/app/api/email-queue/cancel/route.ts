import prisma from '../../../../lib/db';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  await prisma.emailQueue.update({ where: { id }, data: { status: 'cancelled', error_message: null } });
  return Response.json({ success: true });
}
