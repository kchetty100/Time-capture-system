-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_week_ending ON timesheets(week_ending);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_week ON timesheets(user_id, week_ending);

CREATE INDEX IF NOT EXISTS idx_time_entries_timesheet_id ON time_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project);
