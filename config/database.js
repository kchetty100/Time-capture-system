const { Pool } = require('pg');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.pool = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reverside_time_tracker',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }

  connect() {
    if (!this.pool) {
      this.pool = new Pool(this.config);
      console.log('Connected to PostgreSQL database');
    }
    return this.pool;
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection closed');
    }
  }
}

module.exports = new DatabaseConfig();
