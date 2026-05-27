import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { downloadImage } from '@/lib/images/download';
import { Prisma } from '@prisma/client';

// Helper to verify admin role
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

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { rows, fileName, totalRows, failedCount, duplicateCount } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No product rows provided for import' }, { status: 400 });
    }

    const email = auth.email!;
    const name = fileName || 'bulk-upload.xlsx';

    // Step 1: Pre-download all remote images to avoid holding the database transaction open
    // during slow HTTP calls.
    const rowsWithDownloadedImages = await Promise.all(
      rows.map(async (row: any) => {
        const imagePath = await downloadImage(row.image, row.sku || row.name);
        return {
          ...row,
          image: imagePath,
        };
      })
    );

    // Step 2: Perform the database inserts inside a Prisma transaction
    let importedProducts: any[] = [];
    
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // To prevent duplicate products using SKU or product name during commit,
      // we check and make sure that we don't insert duplicate records.
      // If a product with the same SKU or Name already exists, we skip it (or we could update it,
      // but safe partial imports skip/roll back if they violate unique constraints).
      // We will do inserts.
      for (const row of rowsWithDownloadedImages) {
        // Double check uniqueness to prevent race conditions
        if (row.sku) {
          const existingSku = await tx.product.findUnique({
            where: { sku: row.sku },
          });
          if (existingSku) {
            throw new Error(`SKU "${row.sku}" already exists in the database. Commit aborted to prevent duplicates.`);
          }
        }

        const existingName = await tx.product.findFirst({
          where: { name: { equals: row.name, mode: 'insensitive' } },
        });
        if (existingName) {
          throw new Error(`Product name "${row.name}" already exists in the database. Commit aborted to prevent duplicates.`);
        }

        const created = await tx.product.create({
          data: {
            name: row.name,
            description: row.description,
            price: row.price,
            discountPrice: row.discountPrice,
            stock: row.stock,
            category: row.category,
            subcategory: row.subcategory,
            sku: row.sku,
            material: row.material,
            dimensions: row.dimensions,
            tags: row.tags || [],
            moq: row.moq,
            bulkPricingTiers: row.bulkPricingTiers || null,
            image: row.image,
            rating: 0,
            reviewCount: 0,
            featured: false,
          },
        });
        importedProducts.push(created);
      }

      // Step 3: Insert BulkImportLog record inside the transaction
      await tx.bulkImportLog.create({
        data: {
          adminEmail: email,
          fileName: name,
          totalRows: totalRows || rows.length,
          successCount: importedProducts.length,
          failedCount: failedCount || 0,
          duplicateCount: duplicateCount || 0,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedProducts.length} products.`,
      importedCount: importedProducts.length,
    });
  } catch (error: any) {
    console.error('Bulk upload commit error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import products' }, { status: 500 });
  }
}
