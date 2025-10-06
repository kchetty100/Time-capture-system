-- Create timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_ending DATE NOT NULL,
    total_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_ending)
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_timesheets_updated_at 
    BEFORE UPDATE ON timesheets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
