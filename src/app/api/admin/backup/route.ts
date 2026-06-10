import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

const archiver = require('archiver');
import { PassThrough } from 'stream';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
