const express = require('express');
const timesheetService = require('../services/timesheet-service');
const timeEntryRepository = require('../repositories/time-entry-repository');
const userRepository = require('../repositories/user-repository');
const { requireAuth } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Apply authentication middleware to all API routes
router.use(requireAuth);

// Get current user info
router.get('/user', (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// Get timesheet statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await timesheetService.getTimesheetStats();
    res.json({ stats });
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get weekly statistics
router.get('/stats/weekly', async (req, res) => {
  try {
    const startDate = req.query.start_date || moment().subtract(4, 'weeks').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');
    
    const weeklyStats = await timesheetService.getWeeklyStats(startDate, endDate);
    res.json({ weeklyStats });
  } catch (error) {
    console.error('Weekly stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly statistics' });
  }
});

// Get project statistics for user
router.get('/stats/projects', async (req, res) => {
  try {
    const startDate = req.query.start_date || moment().subtract(1, 'month').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');
    
    const projectStats = await timeEntryRepository.getProjectStats(req.user.id, startDate, endDate);
    res.json({ projectStats });
  } catch (error) {
    console.error('Project stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
});

// Get daily hours for user
router.get('/stats/daily', async (req, res) => {
  try {
    const startDate = req.query.start_date || moment().subtract(2, 'weeks').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');
    
    const dailyHours = await timeEntryRepository.getDailyHours(req.user.id, startDate, endDate);
    res.json({ dailyHours });
  } catch (error) {
    console.error('Daily hours API error:', error);
    res.status(500).json({ error: 'Failed to fetch daily hours' });
  }
});

// Get timesheet by ID
router.get('/timesheets/:id', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const timesheet = await timesheetService.getTimesheetWithEntries(timesheetId);
    
    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'employee' && timesheet.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const timeEntries = await timeEntryRepository.findByTimesheetId(timesheetId);
    
    res.json({
      timesheet,
      timeEntries
    });
  } catch (error) {
    console.error('Get timesheet API error:', error);
    res.status(500).json({ error: 'Failed to fetch timesheet' });
  }
});

// Get timesheets for user
router.get('/timesheets', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;
    
    let timesheets;
    
    if (req.user.role === 'admin' && status) {
      // Admin can filter by status
      timesheets = await timesheetService.getTimesheetsByStatus(status);
    } else {
      // Employee can only see their own timesheets
      timesheets = await timesheetService.getTimesheetsByUser(req.user.id);
    }
    
    // Apply pagination
    const paginatedTimesheets = timesheets.slice(offset, offset + limit);
    
    res.json({
      timesheets: paginatedTimesheets,
      pagination: {
        limit,
        offset,
        total: timesheets.length,
        hasMore: offset + limit < timesheets.length
      }
    });
  } catch (error) {
    console.error('Get timesheets API error:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// Create timesheet
router.post('/timesheets', async (req, res) => {
  try {
    const { week_ending, time_entries } = req.body;
    
    if (!week_ending || !time_entries || !Array.isArray(time_entries)) {
      return res.status(400).json({ 
        error: 'week_ending and time_entries are required' 
      });
    }
    
    const timesheet = await timesheetService.createTimesheet(
      req.user.id, 
      week_ending, 
      time_entries
    );
    
    res.status(201).json({
      success: true,
      timesheet,
      message: 'Timesheet created successfully'
    });
  } catch (error) {
    console.error('Create timesheet API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create timesheet' 
    });
  }
});

// Update timesheet
router.put('/timesheets/:id', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const { time_entries } = req.body;
    
    if (!time_entries || !Array.isArray(time_entries)) {
      return res.status(400).json({ 
        error: 'time_entries is required' 
      });
    }
    
    const timesheet = await timesheetService.updateTimesheet(
      timesheetId, 
      req.user.id, 
      time_entries
    );
    
    res.json({
      success: true,
      timesheet,
      message: 'Timesheet updated successfully'
    });
  } catch (error) {
    console.error('Update timesheet API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update timesheet' 
    });
  }
});

// Submit timesheet
router.post('/timesheets/:id/submit', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    
    await timesheetService.submitTimesheet(timesheetId, req.user.id);
    
    res.json({
      success: true,
      message: 'Timesheet submitted successfully'
    });
  } catch (error) {
    console.error('Submit timesheet API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to submit timesheet' 
    });
  }
});

// Admin-only routes
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
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
    console.error('Approve timesheet API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to approve timesheet' 
    });
  }
});

// Reject timesheet
router.post('/timesheets/:id/reject', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const { rejection_reason } = req.body;
    
    await timesheetService.rejectTimesheet(timesheetId, req.user.id, rejection_reason);
    
    res.json({
      success: true,
      message: 'Timesheet rejected successfully'
    });
  } catch (error) {
    console.error('Reject timesheet API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to reject timesheet' 
    });
  }
});

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await userRepository.getEmployees();
    res.json({ employees });
  } catch (error) {
    console.error('Get employees API error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Toggle employee status
router.post('/employees/:id/toggle-status', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await userRepository.findById(employeeId);
    
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const updatedEmployee = await userRepository.update(employeeId, {
      is_active: !employee.is_active
    });
    
    res.json({
      success: true,
      employee: updatedEmployee,
      message: `Employee ${updatedEmployee.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle employee status API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update employee status' 
    });
  }
});

module.exports = router;
