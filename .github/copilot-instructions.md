<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SFGS Admin Portal – Copilot Instructions

- Use Next.js App Router for all frontend and backend API routes.
- Use SQLite for local development, but code as if using Supabase Postgres for production.
- Use Supabase for file storage (PDF uploads) and database only.
- Use Gmail SMTP for all email sending (no other email providers).
- Backend must be serverless-compatible (Vercel).
- No background jobs, no internal schedulers, no batch email sending, no extra services.
- Cron jobs are triggered externally via HTTP to API routes.
- All code must be modular, professional, and suitable for a school admin/ERP system.
- UI must be calm, trustworthy, and professional (no playful/consumer styles).
- Separate UI, API routes, and service logic (email, storage, parsing, logging).
- Proper error handling everywhere.
- Do not implement features that violate the architecture lock or constraints.
