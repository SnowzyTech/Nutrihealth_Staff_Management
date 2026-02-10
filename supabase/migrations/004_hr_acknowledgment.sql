-- Add acknowledgment columns to hr_records table
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS acknowledgment_file_url TEXT;
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE hr_records ADD COLUMN IF NOT EXISTS acknowledgment_notes TEXT;
