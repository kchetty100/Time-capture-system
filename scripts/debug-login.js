const bcrypt = require('bcryptjs');
const db = require('../config/database-sqlite');

async function debugLogin() {
  console.log('🔍 Debugging Login Issue...');
  console.log('============================');
  
  try {
    db.connect();
    console.log('✅ Connected to database');
    
    // Check all users in database
    const users = await db.query('SELECT id, name, email, role, created_at FROM users');
    console.log('\n📋 All users in database:');
    console.log('ID | Name | Email | Role | Created');
    console.log('---|------|-------|------|--------');
    
    if (users.rows && users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`${user.id} | ${user.name} | ${user.email} | ${user.role} | ${user.created_at}`);
      });
    } else {
      console.log('❌ No users found in database!');
    }
    
    // Check admin user specifically
    const admin = await db.queryOne('SELECT * FROM users WHERE email = ?', ['admin@reverside.com']);
    console.log('\n🔐 Admin user details:');
    
    if (admin && admin.rows && admin.rows.length > 0) {
      const adminUser = admin.rows[0];
      console.log(`ID: ${adminUser.id}`);
      console.log(`Name: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`Password Hash: ${adminUser.password.substring(0, 20)}...`);
      console.log(`Created: ${adminUser.created_at}`);
      
      // Test password verification
      const testPassword = 'admin123';
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`\n🔑 Password '${testPassword}' is valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
      
      if (!isPasswordValid) {
        console.log('\n🔧 Fixing password...');
        const newHash = await bcrypt.hash('admin123', 10);
        await db.run('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@reverside.com']);
        console.log('✅ Password updated successfully!');
      }
      
    } else {
      console.log('❌ Admin user not found! Creating now...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, ['Admin User', 'admin@reverside.com', hashedPassword, 'admin']);
      console.log('✅ Admin user created!');
    }
    
    console.log('\n🎯 Try logging in with:');
    console.log('Email: admin@reverside.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

debugLogin();
