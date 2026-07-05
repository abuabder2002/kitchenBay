const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query("SELECT * FROM \"Product\" WHERE id = 'cmr6c86rr000204jji6cm5aol'"))
  .then(res => {
    console.log("Product from DB:", JSON.stringify({
      id: res.rows[0].id,
      name: res.rows[0].name,
      imageLength: res.rows[0].image ? res.rows[0].image.length : 0,
      subImagesCount: res.rows[0].subImages ? res.rows[0].subImages.length : 0,
      video: res.rows[0].video
    }, null, 2));
    client.end();
  })
  .catch(err => {
    console.error("DB Error:", err);
    client.end();
  });
