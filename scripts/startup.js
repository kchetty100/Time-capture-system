const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting REVERSIDE Time Tracker...');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('📁 Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Run database migrations
console.log('🗄️ Running database migrations...');
try {
  execSync('node scripts/migrate-sqlite.js', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}

        // Add default admin user
        console.log('👤 Setting up default admin user...');
        try {
          execSync('node scripts/railway-admin-fix.js', { stdio: 'inherit' });
          console.log('✅ Admin user setup completed');
        } catch (error) {
          console.error('❌ Admin user setup failed:', error.message);
          // Don't exit here, app can still run
        }

        // Fix monthly schema if needed
        console.log('🔧 Checking monthly schema...');
        try {
          execSync('node scripts/fix-monthly-schema.js', { stdio: 'inherit' });
          console.log('✅ Monthly schema check completed');
        } catch (error) {
          console.error('❌ Monthly schema fix failed:', error.message);
          // Don't exit here, app can still run
        }

console.log('✅ Startup completed successfully');
