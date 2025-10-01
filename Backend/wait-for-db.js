// wait-for-db.js
const { Client } = require('pg');

async function waitForDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  while (true) {
    try {
      await client.connect();
      await client.end();
      console.log("Database ready!");
      break;
    } catch {
      console.log("Waiting for DB...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

waitForDb();
