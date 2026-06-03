/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Define headers and some sample data
    const headers = [
      'Product Name',
      'Description',
      'Category',
      'Subcategory',
      'Price',
      'Discount Price',
      'Stock',
      'SKU',
      'Material',
      'Dimensions',
      'Tags',
      'Image URL',
      'MOQ',
      'Bulk Pricing Tiers',
    ];

    const sampleData = [
      {
        'Product Name': 'Cast Iron Tawa (10-inch)',
        'Description': 'Premium pre-seasoned cast iron tawa perfect for dosa and rotis.',
        'Category': 'kitchenware',
        'Subcategory': 'cast-iron-cookwares',
        'Price': 799,
        'Discount Price': 699,
        'Stock': 120,
        'SKU': 'CI-TAWA-10',
        'Material': 'Cast Iron',
        'Dimensions': '25x25x2 cm',
        'Tags': 'tawa, cast iron, kitchenware, dosa tawa',
        'Image URL': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
        'MOQ': 50,
        'Bulk Pricing Tiers': '50:600,100:550',
      },
      {
        'Product Name': 'Traditional Brass Diya',
        'Description': 'Exquisite hand-crafted brass diya for home decoration and rituals.',
        'Category': 'decor',
        'Subcategory': 'lamp-diya',
        'Price': 450,
        'Discount Price': '',
        'Stock': 200,
        'SKU': 'BR-DIYA-TRAD',
        'Material': 'Brass',
        'Dimensions': '10x10x15 cm',
        'Tags': 'diya, brass, home decor, traditional',
        'Image URL': 'https://images.unsplash.com/photo-1608962114225-cc708287718e?w=600&auto=format&fit=crop&q=80',
        'MOQ': 30,
        'Bulk Pricing Tiers': '30:350,60:300',
      },
    ];

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=Kitchenbay_product_template.xlsx',
      },
    });
  } catch (error: any) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Failed to generate product template' }, { status: 500 });
  }
}
