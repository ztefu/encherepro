/**
 * Centralized environment variable validation.
 * This module ensures the app fails fast if required env vars are missing,
 * rather than running silently with placeholder values.
 */

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${key}`);
  }
  return value;
}

// Client-side env vars (available in browser via NEXT_PUBLIC_ prefix)
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;

// Server-side only env vars (only available in API routes, middleware, server components)
export function getServerEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
    STRIPE_SECRET_KEY: requireEnv(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv(process.env.STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET'),
    RESEND_API_KEY: requireEnv(process.env.RESEND_API_KEY, 'RESEND_API_KEY'),
  } as const;
}
