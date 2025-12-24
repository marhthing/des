// System logging utilities
// logEvent, logError, etc.

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function logEvent(type: string, message: string) {
  await supabase.from('SystemLog').insert({
    type,
    message,
    created_at: new Date().toISOString(),
  });
}

export async function logError(type: string, message: string) {
  await supabase.from('SystemLog').insert({
    type: `${type}_error`,
    message,
    created_at: new Date().toISOString(),
  });
}
