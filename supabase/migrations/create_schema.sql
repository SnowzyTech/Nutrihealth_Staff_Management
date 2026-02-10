-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'manager');
CREATE TYPE document_type AS ENUM ('onboarding', 'handbook', 'training', 'policy', 'other');
CREATE TYPE training_status AS ENUM ('not_started', 'in_progress', 'completed', 'expired');
CREATE TYPE handbook_category_type AS ENUM ('general', 'policies', 'procedures', 'benefits', 'safety', 'compliance');

-- Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'staff',
  department TEXT,
  position TEXT,
  profile_image_url TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_contact_phone TEXT,
  date_of_hire DATE,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Onboarding documents table
CREATE TABLE onboarding_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  document_type document_type NOT NULL,
  order_index INTEGER,
  is_required BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding progress table
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES onboarding_documents(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_url TEXT,
  signature_ip TEXT,
  signature_timestamp TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, document_id)
);

-- Training modules table
CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  duration_hours DECIMAL(5, 2),
  is_mandatory BOOLEAN DEFAULT false,
  expiry_months INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training progress table
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  status training_status DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id)
);

-- Handbook categories table
CREATE TABLE handbook_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_type handbook_category_type NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Handbook content table
CREATE TABLE handbook_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES handbook_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HR records table
CREATE TABLE hr_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  visibility TEXT DEFAULT 'private',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- General documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  document_type document_type NOT NULL,
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_resource_type TEXT,
  related_resource_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact inquiries table
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  responded_at TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  responded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_onboarding_progress_user ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_document ON onboarding_progress(document_id);
CREATE INDEX idx_training_progress_user ON training_progress(user_id);
CREATE INDEX idx_training_progress_module ON training_progress(module_id);
CREATE INDEX idx_training_progress_status ON training_progress(status);
CREATE INDEX idx_handbook_categories_type ON handbook_categories(category_type);
CREATE INDEX idx_handbook_content_category ON handbook_content(category_id);
CREATE INDEX idx_handbook_content_published ON handbook_content(is_published);
CREATE INDEX idx_hr_records_user ON hr_records(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created ON contact_inquiries(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view their own onboarding progress" ON onboarding_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers and admins can view team onboarding progress" ON onboarding_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can update their own onboarding progress" ON onboarding_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for training_progress
CREATE POLICY "Users can view their own training progress" ON training_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers and admins can view team training progress" ON training_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can update their own training progress" ON training_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for handbook_content
CREATE POLICY "Published handbook content is viewable by all authenticated users" ON handbook_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all handbook content" ON handbook_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for hr_records
CREATE POLICY "Users can view their own HR records" ON hr_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all HR records" ON hr_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for contact_inquiries
CREATE POLICY "Admins can view contact inquiries" ON contact_inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create contact inquiries" ON contact_inquiries
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_documents_updated_at BEFORE UPDATE ON onboarding_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handbook_categories_updated_at BEFORE UPDATE ON handbook_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handbook_content_updated_at BEFORE UPDATE ON handbook_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_records_updated_at BEFORE UPDATE ON hr_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('staff', 'Regular staff member'),
  ('manager', 'Manager with team oversight capabilities')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
  ('view_dashboard', 'Can view main dashboard'),
  ('manage_users', 'Can manage user accounts'),
  ('manage_documents', 'Can create and manage documents'),
  ('manage_training', 'Can create and manage training modules'),
  ('manage_handbook', 'Can create and manage handbook content'),
  ('view_reports', 'Can view reports and analytics'),
  ('manage_hr_records', 'Can manage HR records'),
  ('audit_logs', 'Can view audit logs')
ON CONFLICT (name) DO NOTHING;
