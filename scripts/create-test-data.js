const bcrypt = require('bcryptjs');
const db = require('../config/database-sqlite');
const moment = require('moment');

async function createTestData() {
  console.log('🚀 Creating Test Data...');
  console.log('========================');
  
  try {
    db.connect();
    console.log('✅ Connected to database');
    
    // Create 10 test users
    console.log('\n👥 Creating test users...');
    const users = [];
    
    for (let i = 1; i <= 10; i++) {
      const userData = {
        name: `Test User ${i}`,
        email: `user${i}@reverside.com`,
        password: await bcrypt.hash('test123', 10),
        role: 'employee'
      };
      
      // Check if user already exists
      const existing = await db.queryOne('SELECT id FROM users WHERE email = ?', [userData.email]);
      if (existing && existing.rows && existing.rows.length > 0) {
        console.log(`⚠️  User ${i} already exists, skipping...`);
        users.push({ id: existing.rows[0].id, ...userData });
        continue;
      }
      
      const result = await db.run(`
        INSERT INTO users (name, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [userData.name, userData.email, userData.password, userData.role]);
      
      users.push({ id: result.lastID, ...userData });
      console.log(`✅ Created user ${i}: ${userData.name} (${userData.email})`);
    }
    
    // Create test timesheets for each user
    console.log('\n📋 Creating test timesheets...');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Create timesheets for the last 3 months
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const monthYear = moment().subtract(monthOffset, 'months').format('YYYY-MM');
        const monthStart = moment(monthYear + '-01').format('YYYY-MM-DD');
        const monthEnd = moment(monthYear + '-01').endOf('month').format('YYYY-MM-DD');
        
        // Check if timesheet already exists
        const existing = await db.queryOne(
          'SELECT id FROM timesheets WHERE user_id = ? AND month_year = ?', 
          [user.id, monthYear]
        );
        
        if (existing && existing.rows && existing.rows.length > 0) {
          console.log(`⚠️  Timesheet for ${user.name} (${monthYear}) already exists, skipping...`);
          continue;
        }
        
        // Generate random timesheet data
        const totalHours = Math.floor(Math.random() * 40) + 20; // 20-60 hours
        const statuses = ['pending', 'submitted', 'approved', 'rejected'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Create timesheet
        const timesheetResult = await db.run(`
          INSERT INTO timesheets (
            user_id, week_ending, month_year, month_start_date, month_end_date,
            total_hours, status, submitted_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          user.id,
          monthEnd,
          monthYear,
          monthStart,
          monthEnd,
          totalHours,
          status,
          status === 'pending' ? null : new Date().toISOString()
        ]);
        
        const timesheetId = timesheetResult.lastID;
        
        // Create time entries for this timesheet
        const projects = [
          'Project Alpha',
          'Project Beta', 
          'Project Gamma',
          'Client Support',
          'Internal Development',
          'Code Review',
          'Documentation',
          'Testing'
        ];
        
        const numEntries = Math.floor(Math.random() * 10) + 5; // 5-15 entries
        
        for (let j = 0; j < numEntries; j++) {
          const project = projects[Math.floor(Math.random() * projects.length)];
          const date = moment(monthStart).add(Math.floor(Math.random() * 30), 'days').format('YYYY-MM-DD');
          const hours = Math.round((Math.random() * 8 + 1) * 10) / 10; // 1-9 hours
          const description = `Work on ${project} - ${generateRandomDescription()}`;
          
          await db.run(`
            INSERT INTO time_entries (
              timesheet_id, project, date, hours, description, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [timesheetId, project, date, hours, description]);
        }
        
        console.log(`✅ Created timesheet for ${user.name} (${monthYear}): ${totalHours}h, ${status}`);
      }
    }
    
    // Create some admin users
    console.log('\n👑 Creating admin users...');
    const adminUsers = [
      { name: 'Admin Manager', email: 'admin.manager@reverside.com' },
      { name: 'HR Admin', email: 'hr.admin@reverside.com' },
      { name: 'Project Manager', email: 'pm@reverside.com' }
    ];
    
    for (const admin of adminUsers) {
      const existing = await db.queryOne('SELECT id FROM users WHERE email = ?', [admin.email]);
      if (existing && existing.rows && existing.rows.length > 0) {
        console.log(`⚠️  Admin ${admin.name} already exists, skipping...`);
        continue;
      }
      
      const hashedPassword = await bcrypt.hash('test123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [admin.name, admin.email, hashedPassword, 'admin']);
      
      console.log(`✅ Created admin: ${admin.name} (${admin.email})`);
    }
    
    // Summary
    console.log('\n📊 Test Data Summary:');
    console.log('====================');
    
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const timesheetCount = await db.query('SELECT COUNT(*) as count FROM timesheets');
    const timeEntryCount = await db.query('SELECT COUNT(*) as count FROM time_entries');
    
    console.log(`👥 Total Users: ${userCount.rows[0].count}`);
    console.log(`📋 Total Timesheets: ${timesheetCount.rows[0].count}`);
    console.log(`⏰ Total Time Entries: ${timeEntryCount.rows[0].count}`);
    
    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('====================');
    console.log('Admin: admin@reverside.com / admin123');
    console.log('Admin: admin.manager@reverside.com / test123');
    console.log('Admin: hr.admin@reverside.com / test123');
    console.log('Admin: pm@reverside.com / test123');
    console.log('Employee: user1@reverside.com / test123');
    console.log('Employee: user2@reverside.com / test123');
    console.log('... (user3@reverside.com through user10@reverside.com)');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await db.close();
  }
}

function generateRandomDescription() {
  const descriptions = [
    'Bug fixes and debugging',
    'Feature implementation',
    'Code refactoring',
    'Client meeting preparation',
    'Testing and QA',
    'Database optimization',
    'API development',
    'Frontend updates',
    'Documentation writing',
    'Performance tuning',
    'Security review',
    'Code review',
    'Deployment preparation',
    'User training',
    'System maintenance'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

createTestData();
