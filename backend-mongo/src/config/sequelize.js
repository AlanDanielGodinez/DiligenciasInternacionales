const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.PG_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

module.exports = sequelize;
