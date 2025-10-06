#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const db = require('../config/database-sqlite');

async function quickFix() {
  console.log('🚀 Quick Fix: Adding Admin User to Railway Database');
  console.log('================================================');
  
  try {
    // Connect to database
    await db.connect();
    console.log('✅ Connected to database');
    
    // Check if admin exists
    const existingAdmin = await db.queryOne('SELECT id FROM users WHERE email = ?', ['admin@reverside.com']);
    
    if (existingAdmin && existingAdmin.rows && existingAdmin.rows.length > 0) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@reverside.com');
      console.log('🔑 Password: admin123');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.run(`
      INSERT INTO users (name, email, password, role, created_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, ['Admin User', 'admin@reverside.com', hashedPassword, 'admin']);
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('📧 Email: admin@reverside.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');
    console.log('🌐 Your app should now be accessible at your Railway URL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔧 Manual fix:');
    console.log('1. Go to your Railway dashboard');
    console.log('2. Open the console/terminal');
    console.log('3. Run: node scripts/add-admin-user.js');
  } finally {
    db.close();
  }
}

quickFix();
