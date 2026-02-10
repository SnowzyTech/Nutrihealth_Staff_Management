-- Migration: Enhanced Documents System
-- This adds metadata column to onboarding_documents for storing subtypes
-- Run this migration to enable the full document management features

-- Add metadata column to onboarding_documents if it doesn't exist
ALTER TABLE onboarding_documents 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add form_data and status tracking to onboarding_progress if not exists
ALTER TABLE onboarding_progress 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMP WITH TIME ZONE;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_status ON onboarding_progress(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_last_saved ON onboarding_progress(last_saved_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_docs_metadata ON onboarding_documents USING GIN (metadata);

-- Update RLS policies for onboarding_progress to allow admin inserts
DO $$ 
BEGIN
  -- Drop existing policies if they exist and recreate
  DROP POLICY IF EXISTS "Admins can insert onboarding progress" ON onboarding_progress;
  DROP POLICY IF EXISTS "Admins can manage all onboarding progress" ON onboarding_progress;
  
  CREATE POLICY "Admins can insert onboarding progress" ON onboarding_progress
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
      ) OR auth.uid() = user_id
    );

  CREATE POLICY "Admins can manage all onboarding progress" ON onboarding_progress
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add RLS policies for hr_records if not exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage all HR records" ON hr_records;
  DROP POLICY IF EXISTS "Admins can insert HR records" ON hr_records;
  
  CREATE POLICY "Admins can manage all HR records" ON hr_records
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
  CREATE POLICY "Admins can insert HR records" ON hr_records
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
