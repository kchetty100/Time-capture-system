-- Update timesheet status constraint to allow draft and submitted statuses
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints directly
-- So we need to recreate the table with the new constraint

-- First, create a backup of existing data
CREATE TABLE timesheets_backup AS SELECT * FROM timesheets;

-- Drop the old table
DROP TABLE timesheets;

-- Recreate the table with updated constraint
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_ending DATE NOT NULL,
    month_year TEXT,
    month_start_date DATE,
    month_end_date DATE,
    total_hours REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'submitted', 'approved', 'rejected')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,
    approved_at DATETIME,
    rejection_reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, month_year)
);

-- Restore data from backup
INSERT INTO timesheets SELECT * FROM timesheets_backup;

-- Drop the backup table
DROP TABLE timesheets_backup;

-- Recreate the trigger
CREATE TRIGGER IF NOT EXISTS update_timesheets_updated_at 
    AFTER UPDATE ON timesheets 
    FOR EACH ROW
    BEGIN
        UPDATE timesheets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month 
ON timesheets(user_id, month_year);
