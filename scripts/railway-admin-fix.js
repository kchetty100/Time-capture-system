#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const db = require('../config/database-sqlite');

async function fixRailwayAdmin() {
  console.log('🚀 Railway Admin Fix');
  console.log('===================');
  
  try {
    // Connect to database
    db.connect();
    console.log('✅ Connected to database');
    
    // Check if users table exists
    const tableCheck = await db.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    if (!tableCheck.rows || tableCheck.rows.length === 0) {
      console.log('❌ Users table does not exist!');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Check current users
    const users = await db.query('SELECT id, name, email, role FROM users');
    console.log('\n📋 Current users:');
    if (users.rows && users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('No users found');
    }
    
    // Check if admin exists
    const admin = await db.queryOne('SELECT * FROM users WHERE email = ?', ['admin@reverside.com']);
    
    if (admin && admin.rows && admin.rows.length > 0) {
      console.log('\n✅ Admin user already exists');
      const adminUser = admin.rows[0];
      console.log(`Admin ID: ${adminUser.id}`);
      console.log(`Admin Name: ${adminUser.name}`);
      console.log(`Admin Role: ${adminUser.role}`);
      
      // Test password
      const testPassword = 'admin123';
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`Password '${testPassword}' is valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
      
      if (!isPasswordValid) {
        console.log('\n🔧 Fixing admin password...');
        const newHash = await bcrypt.hash('admin123', 10);
        await db.run('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@reverside.com']);
        console.log('✅ Admin password updated!');
      }
      
    } else {
      console.log('\n❌ Admin user not found. Creating...');
      
      const adminName = 'System Administrator';
      const adminEmail = 'admin@reverside.com';
      const adminPassword = 'admin123';
      const adminRole = 'admin';
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const result = await db.run(`
        INSERT INTO users (name, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [adminName, adminEmail, hashedPassword, adminRole]);
      
      console.log('✅ Admin user created successfully!');
      console.log(`Admin ID: ${result.lastID}`);
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const finalAdmin = await db.queryOne('SELECT * FROM users WHERE email = ?', ['admin@reverside.com']);
    
    if (finalAdmin && finalAdmin.rows && finalAdmin.rows.length > 0) {
      const adminUser = finalAdmin.rows[0];
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
      
      console.log('✅ Admin user verification:');
      console.log(`- ID: ${adminUser.id}`);
      console.log(`- Name: ${adminUser.name}`);
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- Role: ${adminUser.role}`);
      console.log(`- Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
      
      if (isPasswordValid) {
        console.log('\n🎉 SUCCESS! You can now log in with:');
        console.log('Email: admin@reverside.com');
        console.log('Password: admin123');
      } else {
        console.log('\n❌ Password verification failed');
      }
    } else {
      console.log('❌ Admin user verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

fixRailwayAdmin();
