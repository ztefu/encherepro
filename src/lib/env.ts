/**
 * Centralized environment variable validation.
 * This module ensures the app fails fast if required env vars are missing,
 * rather than running silently with placeholder values.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${key}`);
  }
  return value;
}

// Client-side env vars (available in browser via NEXT_PUBLIC_ prefix)
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;

// Server-side only env vars (only available in API routes, middleware, server components)
export function getServerEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
    RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
  } as const;
}
