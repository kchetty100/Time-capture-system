const timesheetRepository = require('../repositories/timesheet-repository');
const timeEntryRepository = require('../repositories/time-entry-repository');
const moment = require('moment');

class TimesheetService {
  async createTimesheet(userId, weekEnding, timeEntries) {
    // Validate week ending date
    const weekEndingDate = moment(weekEnding, 'YYYY-MM-DD');
    if (!weekEndingDate.isValid()) {
      throw new Error('Invalid week ending date');
    }

    // Check if timesheet already exists for this week
    const existingTimesheet = await timesheetRepository.findOne({
      user_id: userId,
      week_ending: weekEnding
    });

    if (existingTimesheet) {
      throw new Error('Timesheet already exists for this week');
    }

    // Validate time entries
    this.validateTimeEntries(timeEntries);

    // Create timesheet
    const timesheet = await timesheetRepository.create({
      user_id: userId,
      week_ending: weekEnding,
      status: 'pending',
      notes: null
    });

    // Create time entries
    for (const entry of timeEntries) {
      await timeEntryRepository.create({
        timesheet_id: timesheet.id,
        project: entry.project,
        date: entry.date,
        hours: entry.hours,
        description: entry.description || null
      });
    }

    return timesheet;
  }

  async updateTimesheet(timesheetId, userId, timeEntries) {
    // Verify ownership
    const timesheet = await timesheetRepository.findById(timesheetId);
    if (!timesheet || timesheet.user_id !== userId) {
      throw new Error('Timesheet not found or access denied');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Cannot update timesheet that has been processed');
    }

    // Validate time entries
    this.validateTimeEntries(timeEntries);

    // Delete existing time entries
    await timeEntryRepository.deleteByTimesheetId(timesheetId);

    // Create new time entries
    for (const entry of timeEntries) {
      await timeEntryRepository.create({
        timesheet_id: timesheetId,
        project: entry.project,
        date: entry.date,
        hours: entry.hours,
        description: entry.description || null
      });
    }

    return await timesheetRepository.findById(timesheetId);
  }

  async submitTimesheet(timesheetId, userId) {
    const timesheet = await timesheetRepository.findById(timesheetId);
    if (!timesheet || timesheet.user_id !== userId) {
      throw new Error('Timesheet not found or access denied');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Timesheet has already been processed');
    }

    // Check if timesheet has time entries
    const timeEntries = await timeEntryRepository.findByTimesheetId(timesheetId);
    if (timeEntries.length === 0) {
      throw new Error('Cannot submit empty timesheet');
    }

    return await timesheetRepository.update(timesheetId, {
      status: 'pending',
      submitted_at: new Date()
    });
  }

  async approveTimesheet(timesheetId, adminId) {
    const timesheet = await timesheetRepository.findById(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Timesheet has already been processed');
    }

    return await timesheetRepository.approveTimesheet(timesheetId, adminId);
  }

  async rejectTimesheet(timesheetId, adminId, rejectionReason) {
    const timesheet = await timesheetRepository.findById(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Timesheet has already been processed');
    }

    return await timesheetRepository.rejectTimesheet(timesheetId, adminId, rejectionReason);
  }

  async getTimesheetWithEntries(timesheetId) {
    return await timesheetRepository.getTimesheetWithEntries(timesheetId);
  }

  async getTimesheetsByUser(userId, limit = 50, offset = 0) {
    const timesheets = await timesheetRepository.findByUserId(userId);
    return timesheets.slice(offset, offset + limit);
  }

  async getPendingTimesheets() {
    return await timesheetRepository.getPendingTimesheets();
  }

  async getTimesheetStats() {
    return await timesheetRepository.getTimesheetStats();
  }

  async getWeeklyStats(startDate, endDate) {
    return await timesheetRepository.getWeeklyStats(startDate, endDate);
  }

  validateTimeEntries(timeEntries) {
    if (!Array.isArray(timeEntries) || timeEntries.length === 0) {
      throw new Error('At least one time entry is required');
    }

    for (const entry of timeEntries) {
      if (!entry.project || !entry.date || !entry.hours) {
        throw new Error('Project, date, and hours are required for each entry');
      }

      if (entry.hours <= 0 || entry.hours > 24) {
        throw new Error('Hours must be between 0 and 24');
      }

      const entryDate = moment(entry.date, 'YYYY-MM-DD');
      if (!entryDate.isValid()) {
        throw new Error('Invalid date format');
      }
    }
  }

  getWeekEnding(date) {
    return moment(date).endOf('week').format('YYYY-MM-DD');
  }

  getWeekStart(date) {
    return moment(date).startOf('week').format('YYYY-MM-DD');
  }

  getCurrentWeekEnding() {
    return this.getWeekEnding(new Date());
  }

  getPreviousWeekEnding() {
    return this.getWeekEnding(moment().subtract(1, 'week'));
  }
}

module.exports = new TimesheetService();
