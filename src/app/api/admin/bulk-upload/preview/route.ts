/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import * as XLSX from 'xlsx';
import { validateProductRow, BulkProductRow } from '@/lib/validation/bulkUpload';

// Helper to get DB user and verify admin role
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

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Read the workbook using xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array of objects
    // header: 1 returns 2D array, but we want objects mapping keys.
    // Let's use sheet_to_json with defval: null/empty to get objects.
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 });
    }

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const duplicateRows: any[] = [];

    interface ExistingProduct {
      sku: string | null;
      name: string;
    }

    // Fetch existing SKUs and names to check for duplicates
    const existingProducts: ExistingProduct[] = await prisma.product.findMany({
      select: {
        sku: true,
        name: true,
      },
    });

    const existingSkus = new Set(existingProducts.map(p => p.sku?.toLowerCase()).filter(Boolean));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

    // Keep track of SKUs and names present in the uploaded file itself to detect duplicate rows in the import file
    const fileSkus = new Set<string>();
    const fileNames = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const rawRow = rawRows[i];
      const rowIndex = i + 1; // 1-indexed row number in data sheet

      // Standardize headers
      // Map Excel/CSV headers to model fields (case-insensitive mapping)
      const mappedRow: BulkProductRow = {
        name: rawRow['Product Name'] || rawRow['name'] || rawRow['Name'] || '',
        description: rawRow['Description'] || rawRow['description'] || '',
        category: rawRow['Category'] || rawRow['category'] || '',
        subcategory: rawRow['Subcategory'] || rawRow['subcategory'] || rawRow['Sub-category'] || '',
        price: rawRow['Price'] || rawRow['price'] || '',
        discountPrice: rawRow['Discount Price'] || rawRow['discountPrice'] || rawRow['discount_price'] || '',
        stock: rawRow['Stock'] || rawRow['stock'] || rawRow['Quantity'] || rawRow['quantity'] || '',
        sku: rawRow['SKU'] || rawRow['sku'] || '',
        material: rawRow['Material'] || rawRow['material'] || '',
        dimensions: rawRow['Dimensions'] || rawRow['dimensions'] || '',
        tags: rawRow['Tags'] || rawRow['tags'] || '',
        image: rawRow['Image URL'] || rawRow['image'] || rawRow['imageUrl'] || rawRow['Image'] || '',
        moq: rawRow['MOQ'] || rawRow['moq'] || rawRow['Minimum Order Quantity'] || '',
        bulkPricingTiers: rawRow['Bulk Pricing Tiers'] || rawRow['bulkPricingTiers'] || rawRow['bulk_pricing'] || '',
      };

      const { errors, parsedRow } = validateProductRow(mappedRow);

      if (errors.length > 0) {
        invalidRows.push({
          row: rowIndex,
          original: rawRow,
          errors,
        });
      } else if (parsedRow) {
        const skuLower = parsedRow.sku?.toLowerCase() ?? '';
        const nameLower = parsedRow.name?.toLowerCase() ?? '';

        let isDuplicate = false;
        const dupReasons: string[] = [];

        // Check against database
        if (skuLower && existingSkus.has(skuLower)) {
          isDuplicate = true;
          dupReasons.push(`SKU "${parsedRow.sku}" already exists in the database.`);
        }
        if (existingNames.has(nameLower)) {
          isDuplicate = true;
          dupReasons.push(`Product name "${parsedRow.name}" already exists in the database.`);
        }

        // Check against file itself
        if (skuLower && fileSkus.has(skuLower)) {
          isDuplicate = true;
          dupReasons.push(`SKU "${parsedRow.sku}" is duplicated inside the uploaded file.`);
        }
        if (fileNames.has(nameLower)) {
          isDuplicate = true;
          dupReasons.push(`Product name "${parsedRow.name}" is duplicated inside the uploaded file.`);
        }

        if (skuLower) fileSkus.add(skuLower);
        fileNames.add(nameLower);

        if (isDuplicate) {
          duplicateRows.push({
            row: rowIndex,
            data: parsedRow,
            reasons: dupReasons,
          });
        } else {
          validRows.push({
            row: rowIndex,
            data: parsedRow,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rawRows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        duplicateCount: duplicateRows.length,
      },
      validRows,
      invalidRows,
      duplicateRows,
    });
  } catch (error: any) {
    console.error('Bulk upload preview error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate import preview' }, { status: 500 });
  }
}
