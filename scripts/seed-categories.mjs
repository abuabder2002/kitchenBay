/**
 * seed-categories.mjs
 * Seeds all categories and subcategories from mockData into the PostgreSQL DB.
 * Run with: node scripts/seed-categories.mjs
 */
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_rCSIZxFfm0v5@ep-shiny-water-aosx6e79-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

// Matches the categories / subcategories in src/lib/mockData.ts
const CATEGORIES = [
  { slug: 'kitchenware',   name: 'Kitchenware',    isActive: true },
  { slug: 'dining',        name: 'Dining',          isActive: true },
  { slug: 'brass-copper',  name: 'Brass & Copper',  isActive: true },
  { slug: 'decor',         name: 'Décor',           isActive: true },
];

const SUBCATEGORIES = [
  // Kitchenware
  { slug: 'cast-iron-cookwares',   name: 'Cast Iron Cookwares',        categorySlug: 'kitchenware', isActive: true },
  { slug: 'triply-cookwares',      name: 'Triply Cookwares',           categorySlug: 'kitchenware', isActive: true },
  { slug: 'soapstone-cookware',    name: 'Soapstone Cookware',         categorySlug: 'kitchenware', isActive: true },
  { slug: 'kitchen-food-storage',  name: 'Kitchen / Food Storage',     categorySlug: 'kitchenware', isActive: true },
  { slug: 'kitchen-accessories',   name: 'Kitchen Accessories',        categorySlug: 'kitchenware', isActive: true },
  // Dining
  { slug: 'coffee-tea-maker',      name: 'Coffee & Tea Maker',         categorySlug: 'dining',       isActive: true },
  { slug: 'tray-bowls',            name: 'Tray & Bowls',               categorySlug: 'dining',       isActive: true },
  { slug: 'pitcher-cups-glass',    name: 'Pitcher, Cups & Glass',      categorySlug: 'dining',       isActive: true },
  { slug: 'dining-plates',         name: 'Dining Plates',              categorySlug: 'dining',       isActive: true },
  // Brass / Copper
  { slug: 'brass-cookware',        name: 'Brass Cookware',             categorySlug: 'brass-copper', isActive: true },
  { slug: 'copper-cookware',       name: 'Copper Cookware',            categorySlug: 'brass-copper', isActive: true },
  { slug: 'brass-dining',          name: 'Brass Dining & Serving',     categorySlug: 'brass-copper', isActive: true },
  { slug: 'brass-copper-cookware', name: 'All Brass/Copper',           categorySlug: 'brass-copper', isActive: true },
  // Décor
  { slug: 'lamp-diya',             name: 'Lamp & Diya',                categorySlug: 'decor',        isActive: true },
  { slug: 'pooja-essentials',      name: 'Pooja Essentials',           categorySlug: 'decor',        isActive: true },
];

function generateId() {
  return Math.random().toString(36).substr(2, 25);
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Upsert Categories ─────────────────────────────────────────────
    console.log('\n📂 Seeding categories...');
    const categoryIdMap = new Map(); // slug -> DB id

    for (const cat of CATEGORIES) {
      // Check if it already exists by slug
      const existing = await client.query(
        'SELECT id FROM "Category" WHERE slug = $1',
        [cat.slug]
      );

      if (existing.rows.length > 0) {
        console.log(`  ✅ Already exists: ${cat.name} (id=${existing.rows[0].id})`);
        categoryIdMap.set(cat.slug, existing.rows[0].id);
      } else {
        const id = generateId();
        const now = new Date().toISOString();
        await client.query(
          `INSERT INTO "Category" (id, name, slug, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, cat.name, cat.slug, cat.isActive, now, now]
        );
        console.log(`  ➕ Created: ${cat.name} (id=${id})`);
        categoryIdMap.set(cat.slug, id);
      }
    }

    // ── 2. Upsert Subcategories ──────────────────────────────────────────
    console.log('\n📁 Seeding subcategories...');

    for (const sub of SUBCATEGORIES) {
      const categoryId = categoryIdMap.get(sub.categorySlug);
      if (!categoryId) {
        console.error(`  ❌ Missing parent category for slug: ${sub.categorySlug}`);
        continue;
      }

      const existing = await client.query(
        'SELECT id FROM "Subcategory" WHERE slug = $1 AND "categoryId" = $2',
        [sub.slug, categoryId]
      );

      if (existing.rows.length > 0) {
        console.log(`  ✅ Already exists: ${sub.name}`);
      } else {
        const id = generateId();
        const now = new Date().toISOString();
        await client.query(
          `INSERT INTO "Subcategory" (id, name, slug, "categoryId", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, sub.name, sub.slug, categoryId, sub.isActive, now, now]
        );
        console.log(`  ➕ Created: ${sub.name} (under ${sub.categorySlug})`);
      }
    }

    await client.query('COMMIT');

    // ── 3. Verify ────────────────────────────────────────────────────────
    const catCount = await pool.query('SELECT COUNT(*) as count FROM "Category"');
    const subCount = await pool.query('SELECT COUNT(*) as count FROM "Subcategory"');
    console.log(`\n✅ Seed complete!`);
    console.log(`   Categories in DB : ${catCount.rows[0].count}`);
    console.log(`   Subcategories in DB: ${subCount.rows[0].count}`);

    // Print all for confirmation
    const allCats = await pool.query('SELECT name, slug FROM "Category" ORDER BY name');
    const allSubs = await pool.query('SELECT s.name, s.slug, c.name as "categoryName" FROM "Subcategory" s JOIN "Category" c ON s."categoryId" = c.id ORDER BY c.name, s.name');
    console.log('\n📋 Categories:');
    allCats.rows.forEach(r => console.log(`  - ${r.name} (${r.slug})`));
    console.log('\n📋 Subcategories:');
    allSubs.rows.forEach(r => console.log(`  - [${r.categoryName}] ${r.name} (${r.slug})`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
