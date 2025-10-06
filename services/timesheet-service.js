const timesheetRepository = require('../repositories/timesheet-repository');
const timeEntryRepository = require('../repositories/time-entry-repository');
const moment = require('moment');

class TimesheetService {
  async createTimesheet(userId, monthYear, timeEntries, status = 'submitted') {
    // Validate month year format (YYYY-MM)
    const monthYearDate = moment(monthYear, 'YYYY-MM');
    if (!monthYearDate.isValid()) {
      throw new Error('Invalid month year format');
    }

    // Calculate month start and end dates
    const monthStart = monthYearDate.startOf('month').format('YYYY-MM-DD');
    const monthEnd = monthYearDate.endOf('month').format('YYYY-MM-DD');

    // Check if timesheet already exists for this month
    const existingTimesheet = await timesheetRepository.findOne({
      user_id: userId,
      month_year: monthYear
    });

    if (existingTimesheet) {
      throw new Error('Timesheet already exists for this month');
    }

    // Validate time entries (only if not empty)
    if (timeEntries && timeEntries.length > 0) {
      this.validateTimeEntries(timeEntries);
    }

    // Create timesheet
    const timesheet = await timesheetRepository.create({
      user_id: userId,
      month_year: monthYear,
      month_start_date: monthStart,
      month_end_date: monthEnd,
      week_ending: monthEnd, // Keep for backward compatibility
      status: status,
      notes: null
    });

    // Create time entries
    if (timeEntries && timeEntries.length > 0) {
      for (const entry of timeEntries) {
        await timeEntryRepository.create({
          timesheet_id: timesheet.id,
          project: entry.project,
          date: entry.date,
          hours: entry.hours,
          description: entry.description || null
        });
      }
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

  async getTimesheetsByStatus(status) {
    return await timesheetRepository.findByStatus(status);
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

  getMonthYear(date) {
    return moment(date).format('YYYY-MM');
  }

  getMonthStart(monthYear) {
    return moment(monthYear, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
  }

  getMonthEnd(monthYear) {
    return moment(monthYear, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
  }

  getCurrentMonthYear() {
    return this.getMonthYear(new Date());
  }

  getPreviousMonthYear() {
    return this.getMonthYear(moment().subtract(1, 'month'));
  }

  getNextMonthYear() {
    return this.getMonthYear(moment().add(1, 'month'));
  }

  // Keep these for backward compatibility
  getWeekEnding(date) {
    return moment(date).endOf('month').format('YYYY-MM-DD');
  }

  getWeekStart(date) {
    return moment(date).startOf('month').format('YYYY-MM-DD');
  }

  getCurrentWeekEnding() {
    return this.getWeekEnding(new Date());
  }

  getPreviousWeekEnding() {
    return this.getWeekEnding(moment().subtract(1, 'month'));
  }
}

module.exports = new TimesheetService();
