'use client';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  // ClerkProvider removed, returning children directly
  // Supabase Auth doesn't require a global provider at the Next.js level in the same way.
  return <>{children}</>;
}
