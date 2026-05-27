import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// ── Helper: Get or create DB user from Clerk session ────────
async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;
  const name = clerkUser.fullName || clerkUser.username || email.split('@')[0];

  let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { email }, data: { clerkUserId: clerkUser.id, name } });
    } else {
      user = await prisma.user.create({ data: { clerkUserId: clerkUser.id, email, name } });
    }
  }
  return user;
}

/**
 * GET /api/bulk-inquiries/[id]
 *
 * Retrieves details for a specific inquiry.
 * Accessible only by Admins or the owner of the inquiry.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
    const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase();

    const inquiry = await prisma.bulkInquiry.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Auth check: Admin or the matching user
    if (!isAdmin && inquiry.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(inquiry);
  } catch (err: any) {
    console.error('Fetch inquiry detail error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch inquiry details' }, { status: 500 });
  }
}

/**
 * PATCH /api/bulk-inquiries/[id]
 *
 * Admin-only endpoint to update inquiry status, negotiated price, and admin notes.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
    const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { status, adminNotes, negotiatedPrice } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (adminNotes !== undefined) dataToUpdate.adminNotes = adminNotes;
    if (negotiatedPrice !== undefined) {
      dataToUpdate.negotiatedPrice = negotiatedPrice === null ? null : Math.round(negotiatedPrice);
    }

    const updatedInquiry = await prisma.bulkInquiry.update({
      where: { id },
      data: dataToUpdate,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedInquiry);
  } catch (err: any) {
    console.error('Update inquiry error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update inquiry' }, { status: 500 });
  }
}
