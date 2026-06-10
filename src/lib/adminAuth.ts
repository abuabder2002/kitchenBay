/**
 * Centralized admin authentication helpers.
 *
 * getAdminEmails() — returns the merged list of all authorised admin emails.
 * verifyAdmin()    — verifies the current Clerk session is an admin.
 * isAdminUser()    — lightweight boolean check (used in some routes).
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getAdminEmails } from '@/lib/adminEmails';

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
 * Full admin verification using currentUser() from Clerk.
 * Returns the DB user record on success, or an error object.
 */
export async function verifyAdmin(): Promise<AdminAuthSuccess | AdminAuthError> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { error: 'Please sign in to continue', status: 401 };
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return { error: 'Clerk email address not found', status: 401 };
    }

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(email.toLowerCase())) {
      console.warn(`[verifyAdmin] Unauthorized attempt by: ${email}`);
      return { error: 'Unauthorized: Admin privileges required', status: 403 };
    }

    // Upsert user in DB
    let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: email.toLowerCase(),
          name: clerkUser.fullName || clerkUser.username || email.split('@')[0],
          role: 'ADMIN',
        },
      });
    } else if (!user.clerkUserId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { clerkUserId: clerkUser.id, role: 'ADMIN' },
      });
    }

    return { user, email };
  } catch (err: unknown) {
    console.error('[verifyAdmin] Unexpected error:', err);
    return { error: 'Internal auth error', status: 500 };
  }
}

/**
 * Lightweight boolean check using auth() + clerkClient().
 * Used in routes that already handle their own error responses.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session.userId) return false;

    const client = await clerkClient();
    const user = await client.users.getUser(session.userId);
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress || user.emailAddresses[0]?.emailAddress;

    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
  } catch (error) {
    console.error('[isAdminUser] Error:', error);
    return false;
  }
}
