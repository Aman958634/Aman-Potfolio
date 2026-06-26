import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.MYSQL_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Ensure database exists, then create a pool connected to it
const ensureDatabaseAndTables = async () => {

  // Railway MySQL connection
  const pool = mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Yahan tumhara table creation code rahega

  return pool;
};

export default await ensureDatabaseAndTables();