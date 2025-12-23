import prisma from '../../../lib/db';
import { NextRequest } from 'next/server';

// GET /api/settings
export async function GET() {
  // Try to get the first settings row, or return defaults if not found
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    // Provide sensible defaults for local dev
    settings = {
      id: 1,
      daily_email_limit: 100,
      sender_email: 'admin@sfgs.edu',
      email_interval_minutes: 2,
      updated_at: new Date(),
    };
  }
  return Response.json(settings);
}

// POST /api/settings
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Upsert settings (create if not exists, update if exists)
  const updated = await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {
      daily_email_limit: body.daily_email_limit,
      sender_email: body.sender_email,
      email_interval_minutes: body.email_interval_minutes,
    },
    create: {
      id: 1,
      daily_email_limit: body.daily_email_limit,
      sender_email: body.sender_email,
      email_interval_minutes: body.email_interval_minutes,
    },
  });
  return Response.json(updated);
}
