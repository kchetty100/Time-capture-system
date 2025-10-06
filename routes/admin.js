const express = require('express');
const { body, validationResult } = require('express-validator');
const timesheetService = require('../services/timesheet-service');
const userRepository = require('../repositories/user-repository');
const timeEntryRepository = require('../repositories/time-entry-repository');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Test route (no auth for debugging)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin test route working', 
    user: req.user,
    session: req.session,
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    userRole: req.session?.userRole
  });
});

// Test route (no auth for debugging)
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Admin debug route working', 
    user: req.user,
    session: req.session,
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    userRole: req.session?.userRole
  });
});

// Apply authentication middleware to all other routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin dashboard
router.get('/', async (req, res) => {
  try {
    console.log('Admin dashboard accessed by:', req.user);
    console.log('User session:', req.session);
    
    // Simple dashboard with minimal data
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - REVERSIDE Time Tracker',
      user: req.user,
      stats: [
        { status: 'pending', count: 0 },
        { status: 'approved', count: 0 },
        { status: 'rejected', count: 0 },
        { status: 'total', count: 0 }
      ],
      pendingTimesheets: [],
      weeklyStats: [],
      employeeCount: 0
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load admin dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Pending timesheets
router.get('/timesheets/pending', async (req, res) => {
  try {
    const pendingTimesheets = await timesheetService.getPendingTimesheets();
    
    res.render('admin/pending-timesheets', {
      title: 'Pending Timesheets - REVERSIDE Time Tracker',
      user: req.user,
      timesheets: pendingTimesheets
    });
  } catch (error) {
    console.error('Pending timesheets error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load pending timesheets',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// All timesheets
router.get('/timesheets', async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    let timesheets = [];
    let totalCount = 0;
    
    if (status === 'all') {
      // Get all timesheets with pagination
      const allTimesheets = await timesheetService.getTimesheetsByUser(null, 1000); // Get all
      timesheets = allTimesheets.slice(offset, offset + limit);
      totalCount = allTimesheets.length;
    } else {
      const statusTimesheets = await timesheetService.getTimesheetsByStatus(status);
      timesheets = statusTimesheets.slice(offset, offset + limit);
      totalCount = statusTimesheets.length;
    }
    
    res.render('admin/timesheets', {
      title: 'All Timesheets - REVERSIDE Time Tracker',
      user: req.user,
      timesheets,
      currentStatus: status,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('All timesheets error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load timesheets',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// View timesheet details
router.get('/timesheets/:id', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const timesheet = await timesheetService.getTimesheetWithEntries(timesheetId);
    
    if (!timesheet) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Timesheet not found',
        error: {}
      });
    }
    
    const timeEntries = await timeEntryRepository.findByTimesheetId(timesheetId);
    
    res.render('admin/timesheet-details', {
      title: 'Timesheet Details - REVERSIDE Time Tracker',
      user: req.user,
      timesheet,
      timeEntries
    });
  } catch (error) {
    console.error('Timesheet details error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load timesheet details',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Approve timesheet
router.post('/timesheets/:id/approve', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    
    await timesheetService.approveTimesheet(timesheetId, req.user.id);
    
    res.json({ 
      success: true, 
      message: 'Timesheet approved successfully' 
    });

  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to approve timesheet' 
    });
  }
});

// Reject timesheet
router.post('/timesheets/:id/reject', [
  body('rejection_reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const timesheetId = req.params.id;
    const { rejection_reason } = req.body;
    
    await timesheetService.rejectTimesheet(timesheetId, req.user.id, rejection_reason);
    
    res.json({ 
      success: true, 
      message: 'Timesheet rejected successfully' 
    });

  } catch (error) {
    console.error('Reject timesheet error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to reject timesheet' 
    });
  }
});

// Employee management
router.get('/employees', async (req, res) => {
  try {
    const employees = await userRepository.getEmployees();
    
    res.render('admin/employees', {
      title: 'Employee Management - REVERSIDE Time Tracker',
      user: req.user,
      employees
    });
  } catch (error) {
    console.error('Employee management error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load employees',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Toggle employee status
router.post('/employees/:id/toggle-status', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await userRepository.findById(employeeId);
    
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    const updatedEmployee = await userRepository.update(employeeId, {
      is_active: !employee.is_active
    });
    
    res.json({ 
      success: true, 
      message: `Employee ${updatedEmployee.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: updatedEmployee.is_active
    });

  } catch (error) {
    console.error('Toggle employee status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update employee status' 
    });
  }
});

// Reports
router.get('/reports', async (req, res) => {
  try {
    const startDate = req.query.start_date || moment().subtract(1, 'month').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');
    
    const stats = await timesheetService.getTimesheetStats();
    const weeklyStats = await timesheetService.getWeeklyStats(startDate, endDate);
    
    res.render('admin/reports', {
      title: 'Reports - REVERSIDE Time Tracker',
      user: req.user,
      stats,
      weeklyStats,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load reports',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
