import nodemailer from 'nodemailer';

// Email service (Gmail SMTP via nodemailer)
// sendEmail, sendTestEmail, etc.

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: 'SFGS Admin Portal Test Email',
    text: 'This is a test email from SFGS Admin Portal.',
  });
}
