import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import * as XLSX from 'xlsx';

async function verifyAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: 'Please sign in to continue', status: 401 };

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: 'Clerk email address not found', status: 401 };

  const user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
  
  if (!user || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return { error: 'Unauthorized: Admin privileges required', status: 403 };
  }

  return { user, email };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'csv';

    // Fetch all products from PostgreSQL database
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Format products data for export
    const exportData = products.map(p => ({
      'Product ID': p.id,
      'Product Name': p.name,
      'Description': p.description,
      'Category': p.category,
      'Subcategory': p.subcategory || '',
      'Price (INR)': p.price / 100, // Stored in paise, export in Rupees
      'Discount Price (INR)': p.discountPrice ? p.discountPrice / 100 : '',
      'GST %': p.gstPercent,
      'Stock': p.stock,
      'SKU': p.sku || '',
      'Material': p.material || '',
      'Dimensions': p.dimensions || '',
      'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : '',
      'Image URL': p.image,
      'MOQ': p.moq || '',
      'Bulk Pricing Tiers': p.bulkPricingTiers ? JSON.stringify(p.bulkPricingTiers) : '',
      'Created At': p.createdAt.toISOString(),
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === 'excel' || format === 'xlsx') {
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = 'shopnest_products_export.xlsx';
    } else {
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });
      contentType = 'text/csv';
      filename = 'shopnest_products_export.csv';
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting products:', error);
    return NextResponse.json({ error: error.message || 'Failed to export products' }, { status: 500 });
  }
}
