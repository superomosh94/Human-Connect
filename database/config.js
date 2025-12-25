const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'shared_reality',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function for queries
const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

module.exports = { pool, query };
