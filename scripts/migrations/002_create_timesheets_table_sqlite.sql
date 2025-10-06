-- Create timesheets table for SQLite
CREATE TABLE IF NOT EXISTS timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_ending DATE NOT NULL,
    total_hours REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,
    approved_at DATETIME,
    rejection_reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, week_ending)
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_timesheets_updated_at 
    AFTER UPDATE ON timesheets 
    FOR EACH ROW
    BEGIN
        UPDATE timesheets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
