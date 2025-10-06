-- Update timesheets table to support monthly timesheets instead of weekly
-- First, add new columns for monthly tracking
ALTER TABLE timesheets ADD COLUMN month_year TEXT;
ALTER TABLE timesheets ADD COLUMN month_start_date DATE;
ALTER TABLE timesheets ADD COLUMN month_end_date DATE;

-- Update existing records to have month_year based on week_ending
-- Handle duplicate month_year by adding a suffix
UPDATE timesheets 
SET month_year = strftime('%Y-%m', week_ending),
    month_start_date = date(week_ending, 'start of month'),
    month_end_date = date(week_ending, 'start of month', '+1 month', '-1 day')
WHERE month_year IS NULL;

-- Handle any remaining duplicates by adding a suffix
UPDATE timesheets 
SET month_year = month_year || '-week' || ROWID
WHERE month_year IN (
    SELECT month_year 
    FROM timesheets 
    GROUP BY month_year, user_id 
    HAVING COUNT(*) > 1
);

-- Create new unique constraint for monthly timesheets
CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheets_user_month 
ON timesheets(user_id, month_year);

-- Drop the old weekly unique constraint
DROP INDEX IF EXISTS idx_timesheets_user_week_ending;
