import prisma from '../../../../lib/db';
import { sendEmail } from '../../../../lib/email';
import { logEvent, logError } from '../../../../lib/logging';

// API route: POST /api/cron/send-email
export async function POST(req: Request) {
  // Security: check for secret token
  const token = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('token');
  if (token !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Check daily email limit
    const settings = await prisma.systemSettings.findFirst();
    const today = new Date();
    today.setHours(0,0,0,0);
    const sentToday = await prisma.emailQueue.count({
      where: {
        status: 'sent',
        sent_at: { gte: today },
      },
    });
    if (settings && sentToday >= settings.daily_email_limit) {
      return Response.json({ error: 'Daily email limit reached' }, { status: 429 });
    }
    // Fetch one pending email
    const email = await prisma.emailQueue.findFirst({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
      include: { Student: true },
    });
    if (!email) {
      return Response.json({ message: 'No pending emails' });
    }
    // Mark as processing
    await prisma.emailQueue.update({ where: { id: email.id }, data: { status: 'processing' } });
    try {
      // Send email
      let attachments = undefined;
      if (email.email_type === 'pdf') {
        // Find uploaded file for this student
        const uploadedFile = await prisma.uploadedFile.findFirst({
          where: {
            student_id: email.student_id,
            status: 'matched',
          },
          orderBy: { uploaded_at: 'desc' },
        });
        if (uploadedFile) {
          // Get public URL from Supabase
          const { getPDFUrl } = await import('../../../../lib/storage');
          const pdfUrl = await getPDFUrl(uploadedFile.storage_path);
          // Download the PDF to a buffer (for Gmail SMTP attachment)
          const response = await fetch(pdfUrl);
          if (!response.ok) throw new Error('Failed to fetch PDF from storage');
          const buffer = await response.arrayBuffer();
          attachments = [{
            filename: uploadedFile.original_file_name,
            content: Buffer.from(buffer),
            contentType: 'application/pdf',
          }];
        } else {
          // If no PDF found, fail gracefully
          await prisma.emailQueue.update({ where: { id: email.id }, data: { status: 'failed', error_message: 'No PDF found for student' } });
          await logError('email', 'No PDF found for student');
          return Response.json({ error: 'No PDF found for student' }, { status: 404 });
        }
      }
      await sendEmail({
        to: email.recipient_email,
        subject: email.email_type === 'pdf' ? 'Student PDF Document' : 'Happy Birthday!',
        text: email.email_type === 'pdf' ? 'Please find attached your student document.' : `Happy Birthday to ${email.Student?.student_name}!`,
        attachments,
      });
      await prisma.emailQueue.update({ where: { id: email.id }, data: { status: 'sent', sent_at: new Date() } });
      await logEvent('email', `Sent email to ${email.recipient_email}`);
      return Response.json({ success: true });
    } catch (err: any) {
      await prisma.emailQueue.update({ where: { id: email.id }, data: { status: 'failed', error_message: err.message } });
      await logError('email', err.message);
      return Response.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    await logError('cron', error.message || 'Unknown error');
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
