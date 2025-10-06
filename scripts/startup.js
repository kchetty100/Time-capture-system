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

console.log('✅ Startup completed successfully');
