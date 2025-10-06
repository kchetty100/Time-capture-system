const express = require('express');
const { body, validationResult } = require('express-validator');
const timesheetService = require('../services/timesheet-service');
const timeEntryRepository = require('../repositories/time-entry-repository');
const { requireAuth, requireEmployee } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);
router.use(requireEmployee);

// Dashboard
router.get('/', async (req, res) => {
  try {
    const currentWeekEnding = timesheetService.getCurrentWeekEnding();
    const previousWeekEnding = timesheetService.getPreviousWeekEnding();
    
    // Get recent timesheets
    const timesheets = await timesheetService.getTimesheetsByUser(req.user.id, 5);
    
    // Get current week timesheet
    const currentTimesheet = timesheets.find(ts => ts.week_ending === currentWeekEnding);
    
    // Get project stats for last 4 weeks
    const fourWeeksAgo = moment().subtract(4, 'weeks').format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    const projectStats = await timeEntryRepository.getProjectStats(req.user.id, fourWeeksAgo, today);
    
    res.render('employee/dashboard', {
      title: 'Employee Dashboard - REVERSIDE Time Tracker',
      user: req.user,
      timesheets,
      currentTimesheet,
      currentWeekEnding,
      projectStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Timesheet list
router.get('/timesheets', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const timesheets = await timesheetService.getTimesheetsByUser(req.user.id, limit, offset);
    const totalTimesheets = await timesheetService.getTimesheetsByUser(req.user.id);
    
    res.render('employee/timesheets', {
      title: 'My Timesheets - REVERSIDE Time Tracker',
      user: req.user,
      timesheets,
      pagination: {
        page,
        limit,
        total: totalTimesheets.length,
        pages: Math.ceil(totalTimesheets.length / limit)
      }
    });
  } catch (error) {
    console.error('Timesheets list error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load timesheets',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Create timesheet form
router.get('/timesheets/new', (req, res) => {
  const weekEnding = req.query.week_ending || timesheetService.getCurrentWeekEnding();
  const weekStart = timesheetService.getWeekStart(weekEnding);
  
  res.render('employee/timesheet-form', {
    title: 'New Timesheet - REVERSIDE Time Tracker',
    user: req.user,
    weekEnding,
    weekStart,
    timesheet: null,
    timeEntries: [],
    isEdit: false
  });
});

// Edit timesheet form
router.get('/timesheets/:id/edit', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const timesheet = await timesheetService.getTimesheetWithEntries(timesheetId);
    
    if (!timesheet || timesheet.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Timesheet not found',
        error: {}
      });
    }
    
    if (timesheet.status !== 'pending') {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'Cannot edit processed timesheet',
        error: {}
      });
    }
    
    const timeEntries = await timeEntryRepository.findByTimesheetId(timesheetId);
    const weekStart = timesheetService.getWeekStart(timesheet.week_ending);
    
    res.render('employee/timesheet-form', {
      title: 'Edit Timesheet - REVERSIDE Time Tracker',
      user: req.user,
      timesheet,
      timeEntries,
      weekEnding: timesheet.week_ending,
      weekStart,
      isEdit: true
    });
  } catch (error) {
    console.error('Edit timesheet error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load timesheet',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// View timesheet
router.get('/timesheets/:id', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const timesheet = await timesheetService.getTimesheetWithEntries(timesheetId);
    
    if (!timesheet || timesheet.user_id !== req.user.id) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Timesheet not found',
        error: {}
      });
    }
    
    const timeEntries = await timeEntryRepository.findByTimesheetId(timesheetId);
    
    res.render('employee/timesheet-view', {
      title: 'View Timesheet - REVERSIDE Time Tracker',
      user: req.user,
      timesheet,
      timeEntries
    });
  } catch (error) {
    console.error('View timesheet error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load timesheet',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Save timesheet
router.post('/timesheets', [
  body('week_ending').isISO8601(),
  body('time_entries').isArray({ min: 1 }),
  body('time_entries.*.project').notEmpty().trim(),
  body('time_entries.*.date').isISO8601(),
  body('time_entries.*.hours').isFloat({ min: 0.1, max: 24 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { week_ending, time_entries } = req.body;
    
    // Check if timesheet already exists
    const existingTimesheet = await timesheetService.getTimesheetsByUser(req.user.id)
      .then(timesheets => timesheets.find(ts => ts.week_ending === week_ending));
    
    if (existingTimesheet) {
      return res.status(400).json({ 
        error: 'Timesheet already exists for this week' 
      });
    }

    const timesheet = await timesheetService.createTimesheet(
      req.user.id, 
      week_ending, 
      time_entries
    );

    res.json({ 
      success: true, 
      timesheet_id: timesheet.id,
      message: 'Timesheet created successfully' 
    });

  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create timesheet' 
    });
  }
});

// Update timesheet
router.put('/timesheets/:id', [
  body('time_entries').isArray({ min: 1 }),
  body('time_entries.*.project').notEmpty().trim(),
  body('time_entries.*.date').isISO8601(),
  body('time_entries.*.hours').isFloat({ min: 0.1, max: 24 })
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
    const { time_entries } = req.body;

    const timesheet = await timesheetService.updateTimesheet(
      timesheetId, 
      req.user.id, 
      time_entries
    );

    res.json({ 
      success: true, 
      message: 'Timesheet updated successfully' 
    });

  } catch (error) {
    console.error('Update timesheet error:', error);
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
    console.error('Submit timesheet error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to submit timesheet' 
    });
  }
});

// Reports
router.get('/reports', async (req, res) => {
  try {
    const startDate = req.query.start_date || moment().subtract(1, 'month').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');
    
    const projectStats = await timeEntryRepository.getProjectStats(req.user.id, startDate, endDate);
    const dailyHours = await timeEntryRepository.getDailyHours(req.user.id, startDate, endDate);
    
    res.render('employee/reports', {
      title: 'Reports - REVERSIDE Time Tracker',
      user: req.user,
      projectStats,
      dailyHours,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load reports',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
