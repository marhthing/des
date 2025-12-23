import { NextRequest } from 'next/server';
import { sendTestEmail } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const { to } = await req.json();
  if (!to) return Response.json({ error: 'Missing recipient email' }, { status: 400 });
  try {
    await sendTestEmail(to);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
  }
}
