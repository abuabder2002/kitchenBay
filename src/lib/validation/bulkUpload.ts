export interface BulkProductRow {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number | string;
  discountPrice?: number | string;
  stock?: number | string;
  sku?: string;
  material?: string;
  dimensions?: string;
  tags?: string | string[];
  image?: string;
  moq?: number | string;
  bulkPricingTiers?: string | {qty: string | number, price: string | number}[];
}

export interface ValidationError {
  row: number;
  sku?: string;
  name?: string;
  errors: string[];
}

export const VALID_CATEGORIES = ['kitchenware', 'dining', 'decor'];

export interface ParsedProductRow {
  name: string | null;
  description: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  subcategory: string | null;
  sku: string | null;
  material: string | null;
  dimensions: string | null;
  tags: string[];
  moq: number | null;
  bulkPricingTiers: { qty: number; price: number }[] | null;
  image: string;
}

export function validateProductRow(row: BulkProductRow): { errors: string[]; parsedRow?: ParsedProductRow } {
  const errors: string[] = [];
  
  const name = row.name?.toString().trim();
  const description = row.description?.toString().trim();
  const category = row.category?.toString().trim().toLowerCase();
  const subcategory = row.subcategory?.toString().trim() || null;
  const sku = row.sku?.toString().trim() || null;
  const material = row.material?.toString().trim() || null;
  const dimensions = row.dimensions?.toString().trim() || null;
  const image = row.image?.toString().trim() || '';

  // Required Field Checks
  if (!name) errors.push('Product name is required.');
  if (!description) errors.push('Description is required.');
  if (!category) {
    errors.push('Category is required.');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  // Price validation (assuming price is provided in Rupees in file, stored in paise)
  let parsedPrice = 0;
  if (row.price === undefined || row.price === null || row.price === '') {
    errors.push('Price is required.');
  } else {
    parsedPrice = Math.round(parseFloat(row.price.toString()) * 100);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push('Price must be a positive number.');
    }
  }

  // Discount Price validation
  let parsedDiscountPrice: number | null = null;
  if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== '') {
    parsedDiscountPrice = Math.round(parseFloat(row.discountPrice.toString()) * 100);
    if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
      errors.push('Discount price must be a non-negative number.');
    } else if (parsedPrice > 0 && parsedDiscountPrice >= parsedPrice) {
      errors.push('Discount price must be less than the regular price.');
    }
  }

  // Stock validation
  let parsedStock = 0;
  if (row.stock !== undefined && row.stock !== null && row.stock !== '') {
    parsedStock = parseInt(row.stock.toString(), 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      errors.push('Stock must be a non-negative integer.');
    }
  } else {
    errors.push('Stock quantity is required.');
  }

  // MOQ validation
  let parsedMOQ: number | null = null;
  if (row.moq !== undefined && row.moq !== null && row.moq !== '') {
    parsedMOQ = parseInt(row.moq.toString(), 10);
    if (isNaN(parsedMOQ) || parsedMOQ <= 0) {
      errors.push('MOQ must be a positive integer.');
    }
  }

  // Image validation
  if (!image) {
    errors.push('Image URL is required.');
  } else {
    try {
      const url = new URL(image);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('Image must be a valid HTTP or HTTPS URL.');
      }
    } catch {
      errors.push('Image URL is invalid.');
    }
  }

  // Tags parsing (can be comma-separated string or array)
  let parsedTags: string[] = [];
  if (row.tags) {
    if (Array.isArray(row.tags)) {
      parsedTags = row.tags.map(t => t.toString().trim()).filter(Boolean);
    } else {
      parsedTags = row.tags
        .toString()
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
  }

  // Bulk Pricing Tiers parsing
  // Expected format: "qty:price,qty:price" e.g., "50:450,100:400"
  // Where price is in Rupees, stored in paise.
  const parsedTiers: { qty: number; price: number }[] = [];
  if (row.bulkPricingTiers) {
    if (typeof row.bulkPricingTiers === 'string') {
      const parts = row.bulkPricingTiers.split(',').map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        const [qtyStr, priceStr] = part.split(':').map(s => s.trim());
        const qty = parseInt(qtyStr, 10);
        const price = Math.round(parseFloat(priceStr) * 100);
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
          errors.push(`Invalid bulk pricing tier format "${part}". Expected format: qty:price (e.g. 50:450).`);
        } else {
          parsedTiers.push({ qty, price });
        }
      }
    } else if (Array.isArray(row.bulkPricingTiers)) {
      // If already an array (e.g., from direct JSON upload/parsing)
      for (const tier of row.bulkPricingTiers) {
        const qty = parseInt(tier.qty.toString(), 10);
        const price = Math.round(parseFloat(tier.price.toString()) * 100); // Assuming stored tier.price in rupees
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
          errors.push(`Invalid bulk tier format. Expected {qty, price}.`);
        } else {
          parsedTiers.push({ qty, price });
        }
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    parsedRow: {
      name,
      description,
      price: parsedPrice,
      discountPrice: parsedDiscountPrice,
      stock: parsedStock,
      category,
      subcategory,
      sku,
      material,
      dimensions,
      tags: parsedTags,
      moq: parsedMOQ,
      bulkPricingTiers: parsedTiers.length > 0 ? parsedTiers : null,
      image,
    },
  };
}
