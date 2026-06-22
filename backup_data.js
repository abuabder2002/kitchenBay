require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ No DATABASE_URL found in environment variables. Make sure your .env file is present.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// A helper function to safely stringify objects containing BigInts if any
BigInt.prototype.toJSON = function() { return this.toString(); };

async function main() {
  console.log('Starting full database backup. Fetching every detail...');

  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    // 1. Products (including related items)
    backupData.data.products = await prisma.product.findMany({
      include: {
        categoryRel: true,
        subcategoryRel: true,
        bulkInquiryItems: true
      }
    });
    console.log(`✅ Backed up ${backupData.data.products.length} Products (including variants, images, pricing tiers, tags)`);

    // 2. Categories & Subcategories
    backupData.data.categories = await prisma.category.findMany({ include: { subcategories: true } });
    console.log(`✅ Backed up ${backupData.data.categories.length} Categories`);
    
    backupData.data.subcategories = await prisma.subcategory.findMany();
    console.log(`✅ Backed up ${backupData.data.subcategories.length} Subcategories`);

    // 3. Site Settings and Content
    backupData.data.storeSettings = await prisma.storeSettings.findMany();
    backupData.data.siteContent = await prisma.siteContent.findMany();
    backupData.data.traditionVideos = await prisma.traditionVideo.findMany();
    console.log(`✅ Backed up Site Content & Settings`);

    // 4. Users and Addresses
    backupData.data.users = await prisma.user.findMany({ include: { addresses: true } });
    console.log(`✅ Backed up ${backupData.data.users.length} Users & Addresses`);

    // 5. Orders
    backupData.data.orders = await prisma.order.findMany({ include: { items: true } });
    console.log(`✅ Backed up ${backupData.data.orders.length} Orders`);

    // 6. Carts & Wishlists
    backupData.data.carts = await prisma.cart.findMany({ include: { items: true } });
    backupData.data.wishlists = await prisma.wishlist.findMany({ include: { items: true } });
    console.log(`✅ Backed up Carts & Wishlists`);

    // 7. Bulk Inquiries & Import Logs
    backupData.data.bulkInquiries = await prisma.bulkInquiry.findMany({ include: { items: true } });
    backupData.data.bulkImportLogs = await prisma.bulkImportLog.findMany();
    console.log(`✅ Backed up Bulk Inquiries & Logs`);

    // Write everything to file
    fs.writeFileSync('database_backup_full.json', JSON.stringify(backupData, null, 2));
    console.log('\n🎉 SUCCESS! Entire database backed up to database_backup_full.json');

  } catch (error) {
    console.error('❌ Error during backup:', error);
  } finally {
    await prisma.$disconnect();
    // Also end the pool so the process can exit
    await pool.end();
  }
}

main();
