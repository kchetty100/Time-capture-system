const db = require('../config/database-sqlite');

async function fixMonthlySchema() {
  console.log('🔧 Fixing Monthly Timesheet Schema...');
  console.log('=====================================');
  
  try {
    db.connect();
    console.log('✅ Connected to database');
    
    // Check current table structure
    console.log('\n📋 Checking current timesheets table structure...');
    const tableInfo = await db.query('PRAGMA table_info(timesheets)');
    console.log('Current columns:');
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    
    // Check if month_year column exists
    const hasMonthYear = tableInfo.rows.some(col => col.name === 'month_year');
    console.log(`\nmonth_year column exists: ${hasMonthYear ? '✅ YES' : '❌ NO'}`);
    
    if (!hasMonthYear) {
      console.log('\n🔧 Adding missing monthly columns...');
      
      // Add the missing columns
      await db.run('ALTER TABLE timesheets ADD COLUMN month_year TEXT');
      console.log('✅ Added month_year column');
      
      await db.run('ALTER TABLE timesheets ADD COLUMN month_start_date DATE');
      console.log('✅ Added month_start_date column');
      
      await db.run('ALTER TABLE timesheets ADD COLUMN month_end_date DATE');
      console.log('✅ Added month_end_date column');
      
      // Update existing records
      console.log('\n📝 Updating existing records...');
      const updateResult = await db.run(`
        UPDATE timesheets 
        SET month_year = strftime('%Y-%m', week_ending),
            month_start_date = date(week_ending, 'start of month'),
            month_end_date = date(week_ending, 'start of month', '+1 month', '-1 day')
        WHERE month_year IS NULL
      `);
      console.log(`✅ Updated ${updateResult.changes} existing records`);
      
      // Create unique index
      console.log('\n🔗 Creating unique index...');
      await db.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month 
        ON timesheets(user_id, month_year)
      `);
      console.log('✅ Created unique index');
      
      // Fix status constraint
      console.log('\n🔧 Fixing status constraint...');
      try {
        // Check if we need to recreate the table for constraint fix
        const constraintCheck = await db.query(`
          SELECT sql FROM sqlite_master 
          WHERE type='table' AND name='timesheets'
        `);
        
        if (constraintCheck.rows && constraintCheck.rows[0]) {
          const tableSql = constraintCheck.rows[0].sql;
          if (tableSql.includes("status IN ('pending', 'approved', 'rejected')")) {
            console.log('⚠️  Old status constraint found, recreating table...');
            
            // Create backup
            await db.run('CREATE TABLE timesheets_backup AS SELECT * FROM timesheets');
            console.log('✅ Created backup table');
            
            // Drop old table
            await db.run('DROP TABLE timesheets');
            console.log('✅ Dropped old table');
            
            // Recreate with correct constraint
            await db.run(`
              CREATE TABLE timesheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                week_ending DATE NOT NULL,
                month_year TEXT,
                month_start_date DATE,
                month_end_date DATE,
                total_hours REAL DEFAULT 0,
                status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'submitted', 'approved', 'rejected')),
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                approved_by INTEGER,
                approved_at DATETIME,
                rejection_reason TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE(user_id, month_year)
              )
            `);
            console.log('✅ Recreated table with correct constraint');
            
            // Restore data
            await db.run(`
              INSERT INTO timesheets 
              SELECT * FROM timesheets_backup
            `);
            console.log('✅ Restored data from backup');
            
            // Drop backup
            await db.run('DROP TABLE timesheets_backup');
            console.log('✅ Dropped backup table');
            
            // Recreate trigger
            await db.run(`
              CREATE TRIGGER IF NOT EXISTS update_timesheets_updated_at 
                AFTER UPDATE ON timesheets 
                FOR EACH ROW
                BEGIN
                  UPDATE timesheets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
                END
            `);
            console.log('✅ Recreated trigger');
            
            // Recreate indexes
            await db.run(`
              CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month 
              ON timesheets(user_id, month_year)
            `);
            console.log('✅ Recreated indexes');
          }
        }
      } catch (error) {
        console.log('⚠️  Constraint fix error (non-critical):', error.message);
      }
      
    } else {
      console.log('✅ Monthly columns already exist');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const verifyInfo = await db.query('PRAGMA table_info(timesheets)');
    const hasMonthYearAfter = verifyInfo.rows.some(col => col.name === 'month_year');
    console.log(`month_year column exists after fix: ${hasMonthYearAfter ? '✅ YES' : '❌ NO'}`);
    
    if (hasMonthYearAfter) {
      console.log('\n🎉 SUCCESS! Monthly schema is now properly set up');
      console.log('Timesheet submission should now work correctly!');
    } else {
      console.log('\n❌ ERROR: Failed to add month_year column');
    }
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    await db.close();
  }
}

fixMonthlySchema();
