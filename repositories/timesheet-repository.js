const BaseRepository = require('./base-repository');
const db = require('../config/database-sqlite');

class TimesheetRepository extends BaseRepository {
  constructor() {
    super('timesheets');
  }

  async findByUserId(userId, orderBy = 'week_ending DESC') {
    return await this.findAll({ user_id: userId }, orderBy);
  }

  async findByStatus(status, orderBy = 'week_ending DESC') {
    return await this.findAll({ status }, orderBy);
  }

  async findByWeekEnding(weekEnding) {
    return await this.findAll({ week_ending: weekEnding }, 'user_id ASC');
  }

  async getPendingTimesheets() {
    return await this.findByStatus('pending');
  }

  async getApprovedTimesheets() {
    return await this.findByStatus('approved');
  }

  async getRejectedTimesheets() {
    return await this.findByStatus('rejected');
  }

  async approveTimesheet(timesheetId, adminId) {
    return await this.update(timesheetId, {
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date()
    });
  }

  async rejectTimesheet(timesheetId, adminId, rejectionReason = null) {
    return await this.update(timesheetId, {
      status: 'rejected',
      approved_by: adminId,
      approved_at: new Date(),
      rejection_reason: rejectionReason
    });
  }

  async getTimesheetWithEntries(timesheetId) {
    await db.connect();
    const query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        a.name as approved_by_name
      FROM timesheets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.approved_by = a.id
      WHERE t.id = ?
    `;
    
    const result = await db.query(query, [timesheetId]);
    return result.rows[0] || null;
  }

  async getTimesheetStats() {
    await db.connect();
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_hours) as total_hours
      FROM timesheets
      GROUP BY status
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  async getWeeklyStats(startDate, endDate) {
    await db.connect();
    const query = `
      SELECT 
        DATE(week_ending, 'weekday 0', '-6 days') as week,
        COUNT(*) as timesheet_count,
        SUM(total_hours) as total_hours,
        AVG(total_hours) as avg_hours
      FROM timesheets
      WHERE week_ending BETWEEN ? AND ?
      GROUP BY DATE(week_ending, 'weekday 0', '-6 days')
      ORDER BY week DESC
    `;
    
    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }
}

module.exports = new TimesheetRepository();
