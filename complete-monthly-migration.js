const sqlite3 = require('sqlite3').verbose();
const dbPath = './data/reverside_time_tracker.db';
const db = new sqlite3.Database(dbPath);

console.log('Completing monthly migration...');

// Update existing records to have month_year based on week_ending
db.run(`
UPDATE timesheets 
SET month_year = strftime('%Y-%m', week_ending),
    month_start_date = date(week_ending, 'start of month'),
    month_end_date = date(week_ending, 'start of month', '+1 month', '-1 day')
WHERE month_year IS NULL OR month_year = ''
`, (err) => {
  if (err) {
    console.error('Update failed:', err);
  } else {
    console.log('✓ Updated existing records');
    
    // Handle any remaining duplicates by adding a suffix
    db.run(`
    UPDATE timesheets 
    SET month_year = month_year || '-week' || ROWID
    WHERE month_year IN (
        SELECT month_year 
        FROM timesheets 
        GROUP BY month_year, user_id 
        HAVING COUNT(*) > 1
    )
    `, (err) => {
      if (err) {
        console.error('Duplicate handling failed:', err);
      } else {
        console.log('✓ Handled duplicates');
        
        // Create new unique constraint for monthly timesheets
        db.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month 
        ON timesheets(user_id, month_year)
        `, (err) => {
          if (err) {
            console.error('Index creation failed:', err);
          } else {
            console.log('✓ Created monthly index');
            
            // Drop the old weekly unique constraint
            db.run(`
            DROP INDEX IF EXISTS idx_timesheets_user_week_ending
            `, (err) => {
              if (err) {
                console.error('Index drop failed:', err);
              } else {
                console.log('✓ Dropped old weekly index');
                console.log('Monthly migration completed successfully!');
              }
              db.close();
            });
          }
        });
      }
    });
  }
});
