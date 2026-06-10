import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default',
          razorpayKeyId: '',
          razorpayKeySecret: '',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { razorpayKeyId, razorpayKeySecret } = await req.json();

    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: { razorpayKeyId, razorpayKeySecret },
      create: { id: 'default', razorpayKeyId, razorpayKeySecret },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
