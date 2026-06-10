/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
