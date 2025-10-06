const sqlite3 = require('sqlite3').verbose();
const dbPath = './data/reverside_time_tracker.db';
const db = new sqlite3.Database(dbPath);

console.log('Checking timesheets table structure...');

db.all("PRAGMA table_info(timesheets)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Columns in timesheets table:');
    rows.forEach(row => {
      console.log(`- ${row.name}: ${row.type}`);
    });
  }
  db.close();
});
