-- Migration: Enhanced Onboarding Documents System
-- This adds the specific document types and form data storage for onboarding

-- Create ENUM for onboarding document types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_doc_type') THEN
    CREATE TYPE onboarding_doc_type AS ENUM (
      'nda',
      'guarantor_form', 
      'biodata',
      'contract_letter',
      'offer_letter'
    );
  END IF;
END $$;

-- Create ENUM for document submission status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE submission_status AS ENUM (
      'not_started',
      'draft',
      'submitted',
      'approved',
      'rejected'
    );
  END IF;
END $$;

-- Add new columns to onboarding_progress table for enhanced tracking
ALTER TABLE onboarding_progress 
ADD COLUMN IF NOT EXISTS status submission_status DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMP WITH TIME ZONE;

-- Create onboarding_document_templates table for admin-defined templates
CREATE TABLE IF NOT EXISTS onboarding_document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_type onboarding_doc_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  template_file_url TEXT,
  form_schema JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the new table
ALTER TABLE onboarding_document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_document_templates
CREATE POLICY "Anyone can view active templates" ON onboarding_document_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON onboarding_document_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policy for admins to insert/update onboarding_progress
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_status ON onboarding_progress(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_last_saved ON onboarding_progress(last_saved_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_doc_type ON onboarding_document_templates(doc_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_active ON onboarding_document_templates(is_active);

-- Create trigger for updated_at on templates
CREATE OR REPLACE TRIGGER update_onboarding_templates_updated_at 
  BEFORE UPDATE ON onboarding_document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default onboarding document templates
INSERT INTO onboarding_document_templates (doc_type, title, description, instructions, requires_signature, order_index) VALUES
  ('nda', 'Non-Disclosure Agreement', 'Confidentiality agreement to protect company information', 'Please read the agreement carefully, fill in your details, and sign at the bottom.', true, 1),
  ('guarantor_form', 'Guarantor Form', 'Form for providing guarantor information', 'Please provide details of two guarantors who can vouch for your character and employment.', true, 2),
  ('biodata', 'Biodata Form', 'Personal information and background details', 'Please complete all sections with accurate information. Fields marked with * are required.', false, 3),
  ('contract_letter', 'Employment Contract', 'Official employment contract and terms', 'Please review the terms and conditions of your employment carefully before signing.', true, 4),
  ('offer_letter', 'Offer Letter', 'Official job offer and acceptance', 'Please review and sign to accept the job offer.', true, 5)
ON CONFLICT DO NOTHING;
