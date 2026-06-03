import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { PassThrough } from 'stream';
const archiver = require('archiver');

async function verifyAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: 'Please sign in to continue', status: 401 };

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: 'Clerk email address not found', status: 401 };

  let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
  const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
  const isEmailAdmin = adminEmails.includes(email.toLowerCase()) || ['yousufsuhaily@gmail.com', 'kitchenbaythehomeneeds@gmail.com'].includes(email.toLowerCase());

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

    // Fetch all vital data from the database
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
        orders: true,
      },
    });

    const products = await prisma.product.findMany();

    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
    });

    const bulkInquiries = await prisma.bulkInquiry.findMany({
      include: {
        items: true,
      },
    });

    const storeSettings = await prisma.storeSettings.findMany();

    const backupData = {
      timestamp: new Date().toISOString(),
      adminEmail: auth.email,
      data: {
        users,
        products,
        orders,
        bulkInquiries,
        storeSettings,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(passThrough);

    // Append the JSON database dump
    archive.append(jsonString, { name: 'database_backup.json' });

    // We will start the archiving process concurrently
    const processImages = async () => {
      for (const product of products) {
        if (product.image) {
          try {
            const response = await fetch(product.image);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const ext = product.image.split('.').pop()?.split('?')[0] || 'jpg';
            const cleanName = product.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            archive.append(buffer, { name: `images/${cleanName}_${product.id}.${ext}` });
          } catch (e) {
            console.error(`Failed to download image for product ${product.id}`, e);
          }
        }
      }
      archive.finalize();
    };

    // Run in background so stream can be consumed immediately
    processImages();

    const readableWebStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      }
    });

    return new Response(readableWebStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="kitchenbay_backup_${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating backup:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate backup' }, { status: 500 });
  }
}
