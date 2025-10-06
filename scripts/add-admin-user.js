const bcrypt = require('bcrypt');
const db = require('../config/database-sqlite');

async function addAdminUser() {
  try {
    console.log('🔐 Adding default admin user...');
    
    // Connect to database
    await db.connect();
    
    // Check if admin already exists
    const existingAdmin = await db.queryOne('SELECT id FROM users WHERE email = ?', ['admin@reverside.com']);
    
    if (existingAdmin && existingAdmin.rows && existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    const result = await db.run(`
      INSERT INTO users (name, email, password, role, created_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, ['Admin User', 'admin@reverside.com', hashedPassword, 'admin']);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@reverside.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  addAdminUser();
}

module.exports = addAdminUser;
