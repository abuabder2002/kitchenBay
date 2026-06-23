/**
 * Centralized admin authentication helpers.
 *
 * getAdminEmails() — returns the merged list of all authorised admin emails.
 * verifyAdmin()    — verifies the current session is an admin.
 * isAdminUser()    — lightweight boolean check (used in some routes).
 */

import { prisma } from '@/lib/prisma';
import { getAdminEmails } from '@/lib/adminEmails';
import { getDbUser } from '@/lib/serverAuth';

export { getAdminEmails };

interface AdminAuthSuccess {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  email: string;
}

interface AdminAuthError {
  error: string;
  status: number;
}

/**
 * Full admin verification using getDbUser() from serverAuth.
 * Returns the DB user record on success, or an error object.
 */
export async function verifyAdmin(): Promise<AdminAuthSuccess | AdminAuthError> {
  try {
    const user = await getDbUser();
    if (!user) {
      return { error: 'Please sign in to continue', status: 401 };
    }

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(user.email.toLowerCase())) {
      console.warn(`[verifyAdmin] Unauthorized attempt by: ${user.email}`);
      return { error: 'Unauthorized: Admin privileges required', status: 403 };
    }

    // Ensure role is ADMIN in database
    if (user.role !== 'ADMIN') {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      return { user: updatedUser, email: user.email };
    }

    return { user, email: user.email };
  } catch (err: unknown) {
    console.error('[verifyAdmin] Unexpected error:', err);
    return { error: 'Internal auth error', status: 500 };
  }
}

/**
 * Lightweight boolean check.
 * Used in routes that already handle their own error responses.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await getDbUser();
    if (!user) return false;

    return getAdminEmails().includes(user.email.toLowerCase());
  } catch (error) {
    console.error('[isAdminUser] Error:', error);
    return false;
  }
}
