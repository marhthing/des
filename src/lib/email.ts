import { createClient } from '@supabase/supabase-js';

// Email service using Supabase Auth SMTP (send magic link/email via Supabase)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side email
);

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
  // Supabase does not have a direct transactional email API, but you can use the 'inviteUserByEmail' or 'resetPasswordForEmail' as a workaround,
  // or use an Edge Function or external integration for custom emails.
  // Here, we use the 'inviteUserByEmail' as a placeholder for demo purposes.
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(to, {
    redirectTo: process.env.EMAIL_REDIRECT_URL || undefined,
  });
  if (error) throw error;
  return data;
}

export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: 'SFGS Admin Portal Test Email',
    text: 'This is a test email from SFGS Admin Portal.',
  });
}
