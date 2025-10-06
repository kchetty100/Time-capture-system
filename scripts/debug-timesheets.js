const db = require('../config/database-sqlite');

async function debugTimesheets() {
  console.log('🔍 Debugging Timesheets...');
  console.log('==========================');
  
  try {
    db.connect();
    console.log('✅ Connected to database');
    
    // Check all timesheets
    console.log('\n📋 All timesheets in database:');
    const allTimesheets = await db.query(`
      SELECT id, user_id, week_ending, month_year, status, total_hours, created_at, submitted_at
      FROM timesheets 
      ORDER BY created_at DESC
    `);
    
    if (allTimesheets.rows && allTimesheets.rows.length > 0) {
      console.log('ID | User | Week Ending | Month | Status | Hours | Created | Submitted');
      console.log('---|------|-------------|-------|--------|-------|---------|----------');
      allTimesheets.rows.forEach(ts => {
        console.log(`${ts.id} | ${ts.user_id} | ${ts.week_ending} | ${ts.month_year} | ${ts.status} | ${ts.total_hours} | ${ts.created_at} | ${ts.submitted_at}`);
      });
    } else {
      console.log('❌ No timesheets found in database');
    }
    
    // Check pending timesheets specifically
    console.log('\n⏳ Pending timesheets:');
    const pendingTimesheets = await db.query(`
      SELECT id, user_id, week_ending, month_year, status, total_hours, created_at
      FROM timesheets 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);
    
    if (pendingTimesheets.rows && pendingTimesheets.rows.length > 0) {
      console.log('ID | User | Week Ending | Month | Status | Hours | Created');
      console.log('---|------|-------------|-------|--------|-------|---------');
      pendingTimesheets.rows.forEach(ts => {
        console.log(`${ts.id} | ${ts.user_id} | ${ts.week_ending} | ${ts.month_year} | ${ts.status} | ${ts.total_hours} | ${ts.created_at}`);
      });
    } else {
      console.log('❌ No pending timesheets found');
    }
    
    // Check submitted timesheets
    console.log('\n📤 Submitted timesheets:');
    const submittedTimesheets = await db.query(`
      SELECT id, user_id, week_ending, month_year, status, total_hours, created_at
      FROM timesheets 
      WHERE status = 'submitted'
      ORDER BY created_at DESC
    `);
    
    if (submittedTimesheets.rows && submittedTimesheets.rows.length > 0) {
      console.log('ID | User | Week Ending | Month | Status | Hours | Created');
      console.log('---|------|-------------|-------|--------|-------|---------');
      submittedTimesheets.rows.forEach(ts => {
        console.log(`${ts.id} | ${ts.user_id} | ${ts.week_ending} | ${ts.month_year} | ${ts.status} | ${ts.total_hours} | ${ts.created_at}`);
      });
    } else {
      console.log('❌ No submitted timesheets found');
    }
    
    // Check draft timesheets
    console.log('\n📝 Draft timesheets:');
    const draftTimesheets = await db.query(`
      SELECT id, user_id, week_ending, month_year, status, total_hours, created_at
      FROM timesheets 
      WHERE status = 'draft'
      ORDER BY created_at DESC
    `);
    
    if (draftTimesheets.rows && draftTimesheets.rows.length > 0) {
      console.log('ID | User | Week Ending | Month | Status | Hours | Created');
      console.log('---|------|-------------|-------|--------|-------|---------');
      draftTimesheets.rows.forEach(ts => {
        console.log(`${ts.id} | ${ts.user_id} | ${ts.week_ending} | ${ts.month_year} | ${ts.status} | ${ts.total_hours} | ${ts.created_at}`);
      });
    } else {
      console.log('❌ No draft timesheets found');
    }
    
    // Check users
    console.log('\n👥 Users in database:');
    const users = await db.query('SELECT id, name, email, role FROM users');
    if (users.rows && users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`${user.id} | ${user.name} | ${user.email} | ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

debugTimesheets();
