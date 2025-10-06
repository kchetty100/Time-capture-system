// Test setup file
const { runMigrations } = require('../scripts/migrate');

// Setup test database before running tests
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'reverside_time_tracker_test';
    
    try {
        // Run migrations for test database
        await runMigrations();
        console.log('Test database setup completed');
    } catch (error) {
        console.error('Test database setup failed:', error);
        throw error;
    }
});

// Cleanup after all tests
afterAll(async () => {
    // Add any cleanup logic here if needed
    console.log('Test cleanup completed');
});
