const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = './data/reverside_time_tracker.db';
const db = new sqlite3.Database(dbPath);

// Read and run the monthly migration
const migrationPath = './scripts/migrations/006_update_timesheets_to_monthly_sqlite.sql';
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('Running monthly migration...');

db.exec(migrationSQL, (err) => {
  if (err) {
    console.error('Migration failed:', err);
  } else {
    console.log('Monthly migration completed successfully!');
  }
  db.close();
});
