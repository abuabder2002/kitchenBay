import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL is not set' });
  }

  let host = '';
  let pathname = '';
  let username = '';

  try {
    // Parse connection string to safely log details without password
    const urlObj = new URL(connectionString);
    host = urlObj.host;
    pathname = urlObj.pathname;
    username = urlObj.username;
  } catch (e) {
    host = 'invalid url';
  }

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    // Check table list
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    // Check columns of Product table
    const colRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product'
    `);

    // Check count
    let count = 0;
    try {
      const countRes = await pool.query('SELECT COUNT(*) FROM "Product"');
      count = parseInt(countRes.rows[0].count, 10);
    } catch (e) {
      count = -1;
    }

    await pool.end();

    return NextResponse.json({
      host,
      database: pathname,
      username,
      tables: tablesRes.rows.map(r => r.table_name),
      productCount: count,
      columns: colRes.rows
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Failed to query database',
      details: (err as Error).message,
      host,
      database: pathname,
      username
    }, { status: 500 });
  }
}
