-- Add title and description columns to hr_records table
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS description TEXT;
