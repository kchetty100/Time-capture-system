const db = require('../config/database-sqlite');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('Starting SQLite database migrations...');
    
    // Connect to database
    await db.connect();
    
    // Run migration files
    const migrationFiles = [
      '001_create_users_table_sqlite.sql',
      '002_create_timesheets_table_sqlite.sql',
      '003_create_time_entries_table_sqlite.sql',
      '004_create_indexes_sqlite.sql',
      '005_insert_default_admin_sqlite.sql'
    ];
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      if (fs.existsSync(migrationPath)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await db.run(sql);
        console.log(`✓ Completed: ${file}`);
      }
    }
    
    console.log('All SQLite migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
