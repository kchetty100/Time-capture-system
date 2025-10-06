const request = require('supertest');
const app = require('../server');

describe('REVERSIDE Time Tracker API', () => {
    let authCookie;
    let testUserId;

    beforeAll(async () => {
        // Login as admin to get auth cookie
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@reverside.com',
                password: 'admin123'
            });
        
        authCookie = loginResponse.headers['set-cookie'];
    });

    describe('Authentication', () => {
        test('GET / should redirect to login when not authenticated', async () => {
            const response = await request(app)
                .get('/')
                .expect(302);
            
            expect(response.headers.location).toBe('/auth/login');
        });

        test('POST /auth/login should authenticate valid user', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@reverside.com',
                    password: 'admin123'
                })
                .expect(302);
            
            expect(response.headers.location).toBe('/admin');
        });

        test('POST /auth/login should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@reverside.com',
                    password: 'wrongpassword'
                });
            
            expect(response.status).toBe(200);
            expect(response.text).toContain('Invalid email or password');
        });
    });

    describe('API Endpoints', () => {
        test('GET /api/user should return user info when authenticated', async () => {
            const response = await request(app)
                .get('/api/user')
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('role');
        });

        test('GET /api/user should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get('/api/user')
                .expect(401);
            
            expect(response.body).toHaveProperty('error', 'Authentication required');
        });

        test('GET /api/stats should return statistics', async () => {
            const response = await request(app)
                .get('/api/stats')
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('stats');
            expect(Array.isArray(response.body.stats)).toBe(true);
        });
    });

    describe('Timesheet Management', () => {
        let testTimesheetId;

        test('POST /api/timesheets should create new timesheet', async () => {
            const timesheetData = {
                week_ending: '2024-01-07',
                time_entries: [
                    {
                        project: 'Test Project',
                        date: '2024-01-01',
                        hours: 8,
                        description: 'Test work'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/timesheets')
                .set('Cookie', authCookie)
                .send(timesheetData)
                .expect(201);
            
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('timesheet_id');
            testTimesheetId = response.body.timesheet_id;
        });

        test('GET /api/timesheets should return timesheets', async () => {
            const response = await request(app)
                .get('/api/timesheets')
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('timesheets');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.timesheets)).toBe(true);
        });

        test('POST /api/timesheets/:id/submit should submit timesheet', async () => {
            if (!testTimesheetId) {
                // Create a test timesheet first
                const timesheetData = {
                    week_ending: '2024-01-14',
                    time_entries: [
                        {
                            project: 'Test Project 2',
                            date: '2024-01-08',
                            hours: 8,
                            description: 'Test work 2'
                        }
                    ]
                };

                const createResponse = await request(app)
                    .post('/api/timesheets')
                    .set('Cookie', authCookie)
                    .send(timesheetData);
                
                testTimesheetId = createResponse.body.timesheet_id;
            }

            const response = await request(app)
                .post(`/api/timesheets/${testTimesheetId}/submit`)
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('Admin Functions', () => {
        test('GET /api/employees should return employees list', async () => {
            const response = await request(app)
                .get('/api/employees')
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('employees');
            expect(Array.isArray(response.body.employees)).toBe(true);
        });

        test('POST /api/timesheets/:id/approve should approve timesheet', async () => {
            // First create and submit a timesheet
            const timesheetData = {
                week_ending: '2024-01-21',
                time_entries: [
                    {
                        project: 'Test Project 3',
                        date: '2024-01-15',
                        hours: 8,
                        description: 'Test work 3'
                    }
                ]
            };

            const createResponse = await request(app)
                .post('/api/timesheets')
                .set('Cookie', authCookie)
                .send(timesheetData);
            
            const timesheetId = createResponse.body.timesheet_id;

            // Submit the timesheet
            await request(app)
                .post(`/api/timesheets/${timesheetId}/submit`)
                .set('Cookie', authCookie);

            // Approve the timesheet
            const response = await request(app)
                .post(`/api/timesheets/${timesheetId}/approve`)
                .set('Cookie', authCookie)
                .expect(200);
            
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('Error Handling', () => {
        test('GET /nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect(404);
            
            expect(response.text).toContain('Page Not Found');
        });

        test('POST /api/timesheets with invalid data should return 400', async () => {
            const response = await request(app)
                .post('/api/timesheets')
                .set('Cookie', authCookie)
                .send({
                    week_ending: 'invalid-date',
                    time_entries: []
                })
                .expect(400);
            
            expect(response.body).toHaveProperty('error');
        });
    });
});
