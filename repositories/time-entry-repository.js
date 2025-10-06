const BaseRepository = require('./base-repository');
const db = require('../config/database-sqlite');

class TimeEntryRepository extends BaseRepository {
  constructor() {
    super('time_entries');
  }

  async findByTimesheetId(timesheetId) {
    return await this.findAll({ timesheet_id: timesheetId }, 'date ASC');
  }

  async findByUserIdAndDateRange(userId, startDate, endDate) {
    await db.connect();
    const query = `
      SELECT te.*, t.week_ending
      FROM time_entries te
      JOIN timesheets t ON te.timesheet_id = t.id
      WHERE t.user_id = ? 
        AND te.date BETWEEN ? AND ?
      ORDER BY te.date ASC
    `;
    
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
  }

  async getTotalHoursByTimesheet(timesheetId) {
    await db.connect();
    const query = `
      SELECT SUM(hours) as total_hours
      FROM time_entries
      WHERE timesheet_id = ?
    `;
    
    const result = await db.query(query, [timesheetId]);
    return parseFloat(result.rows[0].total_hours) || 0;
  }

  async getProjectStats(userId, startDate, endDate) {
    await db.connect();
    const query = `
      SELECT 
        project,
        COUNT(*) as entry_count,
        SUM(hours) as total_hours,
        AVG(hours) as avg_hours_per_entry
      FROM time_entries te
      JOIN timesheets t ON te.timesheet_id = t.id
      WHERE t.user_id = ? 
        AND te.date BETWEEN ? AND ?
      GROUP BY project
      ORDER BY total_hours DESC
    `;
    
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
  }

  async getDailyHours(userId, startDate, endDate) {
    await db.connect();
    const query = `
      SELECT 
        te.date,
        SUM(te.hours) as total_hours,
        COUNT(*) as entry_count
      FROM time_entries te
      JOIN timesheets t ON te.timesheet_id = t.id
      WHERE t.user_id = ? 
        AND te.date BETWEEN ? AND ?
      GROUP BY te.date
      ORDER BY te.date ASC
    `;
    
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
  }

  async deleteByTimesheetId(timesheetId) {
    await db.connect();
    const query = `DELETE FROM time_entries WHERE timesheet_id = ?`;
    await db.run(query, [timesheetId]);
  }
}

module.exports = new TimeEntryRepository();
