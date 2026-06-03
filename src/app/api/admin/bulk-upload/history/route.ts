/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

async function verifyAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: 'Please sign in to continue', status: 401 };

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: 'Clerk email address not found', status: 401 };

  let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
  const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
  const isEmailAdmin = adminEmails.includes(email.toLowerCase()) || email.toLowerCase() === 'yousufsuhaily@gmail.com';

  if (!isEmailAdmin) {
    return { error: 'Unauthorized: Admin privileges required', status: 403 };
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
  }

  return { user, email };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const logs = await prisma.bulkImportLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error fetching bulk upload history:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bulk upload history' }, { status: 500 });
  }
}
