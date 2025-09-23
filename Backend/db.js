require('dotenv').config();
const Nano = require('nano');

const couchUrl = process.env.COUCHDB_URL;
const dbName = process.env.COUCHDB_DBNAME;

if (!couchUrl || !dbName) {
  throw new Error('COUCHDB_URL of COUCHDB_DBNAME niet gezet in .env');
}

const nano = Nano(couchUrl);

// Optioneel: check of database bestaat
(async () => {
  const dbList = await nano.db.list();
  if (!dbList.includes(dbName)) {
    await nano.db.create(dbName);
    console.log(`Database ${dbName} aangemaakt`);
  }
})();

const db = nano.db.use(dbName);

module.exports = db;
