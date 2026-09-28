const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'diligencias',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

// Support optional SSL (Cloud SQL with private certs or require TLS)
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

// Log the DB config (without password) for debugging
console.log('DB connection config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  ssl: useSsl
});

poolConfig.ssl = useSsl ? { rejectUnauthorized: false } : false;

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  pool
};
