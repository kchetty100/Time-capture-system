const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Create database if it doesn't exist
    await createDatabase();
    
    // Connect to the specific database
    await db.connect();
    
    // Run migration files
    const migrationFiles = [
      '001_create_users_table.sql',
      '002_create_timesheets_table.sql',
      '003_create_time_entries_table.sql',
      '004_create_indexes.sql',
      '005_insert_default_admin.sql'
    ];
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      if (fs.existsSync(migrationPath)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await db.query(sql);
        console.log(`✓ Completed: ${file}`);
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

async function createDatabase() {
  const { Pool } = require('pg');
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Connect to default postgres database first
  };
  
  const pool = new Pool(config);
  
  try {
    // Check if database exists
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME || 'reverside_time_tracker']
    );
    
    if (result.rows.length === 0) {
      console.log('Creating database...');
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'reverside_time_tracker'}`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
