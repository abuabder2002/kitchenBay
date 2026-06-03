import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
    const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());

    if (!user || !email || (!adminEmails.includes(email.toLowerCase()) && !['yousufsuhaily@gmail.com', 'kitchenbaythehomeneeds@gmail.com'].includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
    const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());

    if (!user || !email || (!adminEmails.includes(email.toLowerCase()) && !['yousufsuhaily@gmail.com', 'kitchenbaythehomeneeds@gmail.com'].includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
