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
