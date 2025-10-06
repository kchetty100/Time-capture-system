-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    timesheet_id INTEGER NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    project VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON time_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update timesheet total_hours when time entries change
CREATE OR REPLACE FUNCTION update_timesheet_total_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total_hours for the affected timesheet
    UPDATE timesheets 
    SET total_hours = (
        SELECT COALESCE(SUM(hours), 0) 
        FROM time_entries 
        WHERE timesheet_id = COALESCE(NEW.timesheet_id, OLD.timesheet_id)
    )
    WHERE id = COALESCE(NEW.timesheet_id, OLD.timesheet_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_timesheet_hours_on_insert
    AFTER INSERT ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_timesheet_total_hours();

CREATE TRIGGER update_timesheet_hours_on_update
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_timesheet_total_hours();

CREATE TRIGGER update_timesheet_hours_on_delete
    AFTER DELETE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_timesheet_total_hours();
