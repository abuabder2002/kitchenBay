const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'C:\\Users\\ABDER SHAHEEN\\Downloads\\KB 2.0 Update (2).xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Map subcategories to curated high-quality Unsplash image arrays
const imageMap = {
  'Cast Iron Cookwares': [
    '/images/products/cast_iron_tawa.png', // custom generated image
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop'
  ],
  'Triply Cookwares': [
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop'
  ],
  'Soapstone Cookware': [
    'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514986879800-94ef75796248?w=600&auto=format&fit=crop'
  ],
  'Kitchen/ Food Storage': [
    'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&auto=format&fit=crop'
  ],
  'Kitchen Accessories': [
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'
  ],
  'Coffee & Tea Maker': [
    '/images/products/brass_coffee_dabara.png', // custom generated image
    'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop'
  ],
  'Tray & Bowls': [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'
  ],
  'Pitcher, Cups & Glass': [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603566164673-8a3c874bc0b3?w=600&auto=format&fit=crop'
  ],
  'Brass/Copper Cookware': [
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610393221976-654dbdbb242e?w=600&auto=format&fit=crop'
  ],
  'Dining Plates': [
    'https://images.unsplash.com/photo-1603180811123-885c8b18f3a8?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop'
  ],
  'Lamp & Diya': [
    '/images/products/traditional_brass_diya.png', // custom generated image
    'https://images.unsplash.com/photo-1605389659020-f5e93345e69e?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop'
  ]
};

function getProductImage(subcategory, index) {
  const list = imageMap[subcategory] || [
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop'
  ];
  return list[index % list.length];
}

function getProductDescription(name, subcategory) {
  return `Premium handcrafted ${name} from our exclusive ${subcategory} collection. Created by master artisans using traditional techniques combined with modern safety and quality standards. Durable, functional, and rich with cultural heritage. Perfect for daily kitchen use or festive decor.`;
}

function parsePrices(priceStr) {
  if (!priceStr) return { originalPrice: 0, salePrice: 0 };
  
  const matches = priceStr.match(/₹\s*([0-9,]+(?:\.[0-9]+)?)/g);
  if (!matches) {
    return { originalPrice: 0, salePrice: 0 };
  }

  const cleanNum = (str) => {
    return parseFloat(str.replace(/₹/g, '').replace(/,/g, '').trim());
  };

  if (matches.length >= 2) {
    const p1 = cleanNum(matches[0]);
    const p2 = cleanNum(matches[1]);
    return { originalPrice: p1, salePrice: p2 };
  } else if (matches.length === 1) {
    const p = cleanNum(matches[0]);
    return { originalPrice: p, salePrice: p };
  }
  
  return { originalPrice: 0, salePrice: 0 };
}

let currentCategory = 'Kitchenware';
let currentSubcategory = '';

const parsedProducts = [];

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;

  const col0 = row[0] ? String(row[0]).trim() : '';
  const col1 = row[1] ? String(row[1]).trim() : '';
  const col2 = row[2] ? String(row[2]).trim() : '';
  const col3 = row[3] ? String(row[3]).trim() : '';

  if (col1 && !col2) {
    if (col0 === '*') {
      currentSubcategory = col1;
    } else {
      currentCategory = col1;
      currentSubcategory = '';
    }
  } else if (col1 && col2) {
    currentSubcategory = col1;
    addProduct(col2, col3, currentCategory, currentSubcategory, i);
  } else if (!col1 && col2) {
    addProduct(col2, col3, currentCategory, currentSubcategory, i);
  }
}

function addProduct(name, priceStr, category, subcategory, rowIndex) {
  if (!name) return;
  const { originalPrice, salePrice } = parsePrices(priceStr);
  const gstPercent = 18; // Default standard GST
  // base price is finalPrice / (1 + gstPercent/100)
  const finalPrice = salePrice > 0 ? salePrice : 500; // fallback if zero
  const price = Math.round(finalPrice / (1 + gstPercent / 100));

  // Determine a unique stable ID based on index
  const id = `prod-${rowIndex}`;

  // category id mapping (lowercase)
  const categoryMap = {
    'Kitchenware': 'kitchenware',
    'Dining': 'dining',
    'Décor': 'decor'
  };
  const categoryId = categoryMap[category] || 'kitchenware';

  // simulated metrics
  const rating = parseFloat((4.0 + (rowIndex % 10) * 0.1).toFixed(1));
  const reviewCount = 20 + (rowIndex * 7) % 250;
  const stock = 15 + (rowIndex * 3) % 95;
  const featured = rowIndex % 7 === 0; // mark some products as featured

  parsedProducts.push({
    id,
    name: name.trim(),
    description: getProductDescription(name.trim(), subcategory),
    price,
    gstPercent,
    finalPrice,
    stock,
    category: categoryId,
    image: getProductImage(subcategory, rowIndex),
    rating,
    reviewCount,
    featured
  });
}

// Generate the TypeScript contents of mockData.ts
const counts = { kitchenware: 0, dining: 0, decor: 0 };
parsedProducts.forEach(p => {
  counts[p.category]++;
});

const tsContent = `export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gstPercent: number;
  finalPrice: number;
  stock: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  total: number;
  address: string;
  paymentMethod: string;
}

export const categories = [
  { id: 'kitchenware', name: 'Kitchenware', icon: '🍳', count: ${counts.kitchenware} },
  { id: 'dining', name: 'Dining', icon: '🍽️', count: ${counts.dining} },
  { id: 'decor', name: 'Décor', icon: '🏺', count: ${counts.decor} },
];

export const products: Product[] = ${JSON.stringify(parsedProducts, null, 2)};

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    date: '2026-04-25',
    status: 'delivered',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 2 },
    ],
    subtotal: 10597,
    cgstAmount: 804,
    sgstAmount: 803,
    gstAmount: 1607,
    total: 12204,
    address: '12, MG Road, Bangalore, Karnataka - 560001',
    paymentMethod: 'UPI',
  },
  {
    id: 'ORD-002',
    customer: 'Priya Mehta',
    email: 'priya.mehta@example.com',
    date: '2026-04-26',
    status: 'shipped',
    items: [
      { product: products[1], quantity: 1 },
    ],
    subtotal: 12499,
    cgstAmount: 1125,
    sgstAmount: 1125,
    gstAmount: 2250,
    total: 14749,
    address: '45, Andheri West, Mumbai, Maharashtra - 400058',
    paymentMethod: 'Card',
  },
  {
    id: 'ORD-003',
    customer: 'Amit Patel',
    email: 'amit.patel@example.com',
    date: '2026-04-27',
    status: 'processing',
    items: [
      { product: products[4], quantity: 1 },
      { product: products[8], quantity: 1 },
    ],
    subtotal: 6798,
    cgstAmount: 408,
    sgstAmount: 408,
    gstAmount: 816,
    total: 7614,
    address: '78, CG Road, Ahmedabad, Gujarat - 380009',
    paymentMethod: 'COD',
  },
  {
    id: 'ORD-004',
    customer: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    date: '2026-04-28',
    status: 'pending',
    items: [
      { product: products[6], quantity: 2 },
    ],
    subtotal: 2998,
    cgstAmount: 270,
    sgstAmount: 270,
    gstAmount: 540,
    total: 3538,
    address: '23, Banjara Hills, Hyderabad, Telangana - 500034',
    paymentMethod: 'UPI',
  },
  {
    id: 'ORD-005',
    customer: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    date: '2026-04-24',
    status: 'cancelled',
    items: [
      { product: products[7], quantity: 1 },
    ],
    subtotal: 6499,
    cgstAmount: 585,
    sgstAmount: 585,
    gstAmount: 1170,
    total: 7669,
    address: '56, Sector 17, Chandigarh - 160017',
    paymentMethod: 'Card',
  },
];

export const dashboardStats = {
  totalRevenue: 1845230,
  totalOrders: 3847,
  totalProducts: ${parsedProducts.length},
  totalCustomers: 12847,
  revenueGrowth: 18.5,
  ordersGrowth: 12.3,
  productsGrowth: 5.2,
  customersGrowth: 23.1,
};
`;

const outputPath = path.join(__dirname, 'mockData.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log(`Successfully generated new mockData.ts with ${parsedProducts.length} products!`);
console.log('Counts:', counts);
