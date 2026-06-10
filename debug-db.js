const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query("SELECT * FROM \"StoreSettings\" WHERE id = 'default'"))
  .then(res => {
    console.log(res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
