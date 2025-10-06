-- Create time_entries table for SQLite
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timesheet_id INTEGER NOT NULL,
    project TEXT NOT NULL,
    date DATE NOT NULL,
    hours REAL NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_time_entries_updated_at 
    AFTER UPDATE ON time_entries 
    FOR EACH ROW
    BEGIN
        UPDATE time_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Create trigger to update timesheet total_hours when time entries change
CREATE TRIGGER IF NOT EXISTS update_timesheet_total_hours_insert
    AFTER INSERT ON time_entries
    FOR EACH ROW
    BEGIN
        UPDATE timesheets 
        SET total_hours = (
            SELECT COALESCE(SUM(hours), 0) 
            FROM time_entries 
            WHERE timesheet_id = NEW.timesheet_id
        )
        WHERE id = NEW.timesheet_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_timesheet_total_hours_update
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    BEGIN
        UPDATE timesheets 
        SET total_hours = (
            SELECT COALESCE(SUM(hours), 0) 
            FROM time_entries 
            WHERE timesheet_id = NEW.timesheet_id
        )
        WHERE id = NEW.timesheet_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_timesheet_total_hours_delete
    AFTER DELETE ON time_entries
    FOR EACH ROW
    BEGIN
        UPDATE timesheets 
        SET total_hours = (
            SELECT COALESCE(SUM(hours), 0) 
            FROM time_entries 
            WHERE timesheet_id = OLD.timesheet_id
        )
        WHERE id = OLD.timesheet_id;
    END;
