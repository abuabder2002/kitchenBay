import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
  }

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[MIGRATE] Running ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "attributes" JSONB...');
    const result = await pool.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "attributes" JSONB');
    
    // Check columns of Product table after change
    const colRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product' AND column_name = 'attributes'
    `);

    await pool.end();

    return NextResponse.json({
      message: 'Migration executed successfully',
      result,
      columns: colRes.rows
    });
  } catch (err) {
    console.error('[MIGRATE] Error running migration:', err);
    return NextResponse.json({
      error: 'Migration failed',
      details: (err as Error).message
    }, { status: 500 });
  }
}
