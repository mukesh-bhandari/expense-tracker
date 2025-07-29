const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const start = Date.now();
pool.query("SELECT NOW()", (err, res) => {
  const duration = Date.now() - start;
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Query took:", duration, "ms");
    console.log("Result:", res.rows[0]);
  }
  pool.end();
});
