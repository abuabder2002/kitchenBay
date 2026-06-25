const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query("SELECT COUNT(*) FROM \"Product\""))
  .then(res => {
    console.log("Total Products in DB:", res.rows[0].count);
    return client.query("SELECT id, name, SUBSTRING(image, 1, 30) AS image_preview FROM \"Product\" LIMIT 10");
  })
  .then(res => {
    console.log("Sample products:", res.rows);
    client.end();
  })
  .catch(err => {
    console.error("DB Error:", err);
    client.end();
  });
