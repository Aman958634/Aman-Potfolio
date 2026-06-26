import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.MYSQL_URL;

const ensureDatabaseAndTables = async () => {
  const pool = mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // test connection
  const conn = await pool.getConnection();
  console.log('✅ MySQL Connected');
  conn.release();

  return pool;   // <<< YE LINE ZAROOR HOGI
};

export default await ensureDatabaseAndTables();