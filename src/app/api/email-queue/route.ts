import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// API route: GET /api/email-queue
export async function GET(request: Request) {
  // Parse query params for filters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const emailType = searchParams.get('email_type');
  const matricNumber = searchParams.get('matric_number');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  let query = supabase
    .from('EmailQueue')
    .select('*, Student(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (emailType) query = query.eq('email_type', emailType);
  if (matricNumber) query = query.eq('matric_number', matricNumber);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data: queue, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(queue ?? []);
}

// API route: POST /api/email-queue
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipients,
      subject,
      body: emailBody,
      sender,
      attachmentUrl,
      manual,
    } = body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: "No recipients provided." }, { status: 400 });
    }
    // Insert one queue entry per recipient
    const inserts = recipients.map((recipient: string) => ({
      recipient_email: recipient,
      email_type: manual ? "manual" : "other",
      status: "queued",
      subject,
      body: emailBody,
      sender_email: sender || null,
      attachment_url: attachmentUrl || null,
      created_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("EmailQueue").insert(inserts);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
