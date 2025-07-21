-- Pregnancy Blood Pressure Tracker Database Schema
-- HIPAA-compliant design with audit trails and comprehensive tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS medication_entries CASCADE;
DROP TABLE IF EXISTS symptom_entries CASCADE;
DROP TABLE IF EXISTS blood_pressure_readings CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS symptoms CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table (enhanced)
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  
  -- Emergency contact information
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Healthcare provider information
  healthcare_provider_name TEXT,
  healthcare_provider_phone TEXT,
  healthcare_provider_address TEXT,
  
  -- Pregnancy information
  due_date DATE,
  pregnancy_start_date DATE,
  pregnancy_weeks INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN pregnancy_start_date IS NOT NULL 
      THEN (CURRENT_DATE - pregnancy_start_date) / 7
      ELSE NULL 
    END
  ) STORED,
  
  -- Blood pressure targets
  bp_target_systolic INTEGER CHECK (bp_target_systolic BETWEEN 90 AND 180),
  bp_target_diastolic INTEGER CHECK (bp_target_diastolic BETWEEN 60 AND 120),
  
  -- Medical history flags
  medical_history JSONB DEFAULT '{}',
  risk_factors TEXT[],
  
  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  measurement_unit TEXT DEFAULT 'mmHg' CHECK (measurement_unit IN ('mmHg', 'kPa')),
  notification_preferences JSONB DEFAULT '{}',
  
  -- HIPAA compliance fields
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create symptoms reference table
CREATE TABLE symptoms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('physical', 'emotional', 'pregnancy-specific', 'cardiovascular')),
  description TEXT,
  severity_scale INTEGER DEFAULT 5 CHECK (severity_scale BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications reference table
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('antihypertensive', 'prenatal', 'supplement', 'other')),
  dosage_forms TEXT[] DEFAULT ARRAY['tablet', 'capsule', 'liquid'],
  pregnancy_category TEXT CHECK (pregnancy_category IN ('A', 'B', 'C', 'D', 'X')),
  common_dosages TEXT[],
  description TEXT,
  warnings TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blood_pressure_readings table (enhanced)
CREATE TABLE blood_pressure_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Core measurements
  systolic INTEGER NOT NULL CHECK (systolic BETWEEN 70 AND 250),
  diastolic INTEGER NOT NULL CHECK (diastolic BETWEEN 40 AND 150),
  heart_rate INTEGER CHECK (heart_rate BETWEEN 40 AND 200),
  
  -- Reading context
  reading_time TIMESTAMP WITH TIME ZONE NOT NULL,
  position TEXT CHECK (position IN ('sitting', 'lying', 'standing')),
  arm_used TEXT CHECK (arm_used IN ('left', 'right')),
  device_used TEXT,
  
  -- Additional measurements
  weight_kg DECIMAL(5,2) CHECK (weight_kg BETWEEN 30 AND 300),
  
  -- Context and notes
  notes TEXT,
  activity_before_reading TEXT,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  
  -- Flags
  medication_taken BOOLEAN DEFAULT FALSE,
  felt_symptoms BOOLEAN DEFAULT FALSE,
  is_manual_entry BOOLEAN DEFAULT TRUE,
  
  -- Data integrity
  is_deleted BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  local_id TEXT, -- For offline sync
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'user',
  
  CONSTRAINT bp_readings_user_fk FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Create symptom_entries table
CREATE TABLE symptom_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  reading_id UUID REFERENCES blood_pressure_readings(id) ON DELETE CASCADE,
  symptom_id UUID REFERENCES symptoms(id),
  
  -- Symptom details
  custom_symptom_name TEXT, -- For symptoms not in reference table
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  notes TEXT,
  
  -- Timing
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Data integrity
  is_deleted BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  local_id TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT symptom_entries_user_fk FOREIGN KEY (user_id) REFERENCES user_profiles(user_id),
  CONSTRAINT symptom_or_custom CHECK (symptom_id IS NOT NULL OR custom_symptom_name IS NOT NULL)
);

-- Create medication_entries table
CREATE TABLE medication_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  reading_id UUID REFERENCES blood_pressure_readings(id) ON DELETE SET NULL,
  medication_id UUID REFERENCES medications(id),
  
  -- Medication details
  custom_medication_name TEXT, -- For medications not in reference table
  dosage TEXT NOT NULL,
  dosage_unit TEXT DEFAULT 'mg',
  frequency TEXT, -- e.g., "twice daily", "as needed"
  route TEXT DEFAULT 'oral' CHECK (route IN ('oral', 'injection', 'topical', 'other')),
  
  -- Timing
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prescribed_by TEXT,
  
  -- Additional context
  taken_with_food BOOLEAN,
  missed_dose BOOLEAN DEFAULT FALSE,
  side_effects TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  
  -- Data integrity
  is_deleted BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  local_id TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT medication_entries_user_fk FOREIGN KEY (user_id) REFERENCES user_profiles(user_id),
  CONSTRAINT medication_or_custom CHECK (medication_id IS NOT NULL OR custom_medication_name IS NOT NULL)
);

-- Create user_sessions table for enhanced security tracking
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT user_sessions_user_fk FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Create audit_logs table for HIPAA compliance
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

CREATE INDEX idx_bp_readings_user_id ON blood_pressure_readings(user_id);
CREATE INDEX idx_bp_readings_reading_time ON blood_pressure_readings(reading_time DESC);
CREATE INDEX idx_bp_readings_user_time ON blood_pressure_readings(user_id, reading_time DESC);
CREATE INDEX idx_bp_readings_sync_status ON blood_pressure_readings(sync_status) WHERE sync_status != 'synced';
CREATE INDEX idx_bp_readings_not_deleted ON blood_pressure_readings(user_id, reading_time DESC) WHERE is_deleted = FALSE;

CREATE INDEX idx_symptom_entries_user_id ON symptom_entries(user_id);
CREATE INDEX idx_symptom_entries_reading_id ON symptom_entries(reading_id);
CREATE INDEX idx_symptom_entries_occurred_at ON symptom_entries(occurred_at DESC);

CREATE INDEX idx_medication_entries_user_id ON medication_entries(user_id);
CREATE INDEX idx_medication_entries_reading_id ON medication_entries(reading_id);
CREATE INDEX idx_medication_entries_taken_at ON medication_entries(taken_at DESC);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Blood pressure readings policies
CREATE POLICY "Users can view their own readings" ON blood_pressure_readings
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub' AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own readings" ON blood_pressure_readings
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own readings" ON blood_pressure_readings
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can soft delete their own readings" ON blood_pressure_readings
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Symptom entries policies
CREATE POLICY "Users can view their own symptoms" ON symptom_entries
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub' AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own symptoms" ON symptom_entries
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own symptoms" ON symptom_entries
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Medication entries policies
CREATE POLICY "Users can view their own medications" ON medication_entries
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub' AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own medications" ON medication_entries
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own medications" ON medication_entries
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- Reference tables (symptoms, medications) - public read access
CREATE POLICY "Anyone can read symptoms" ON symptoms
  FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "Anyone can read medications" ON medications
  FOR SELECT TO authenticated USING (is_active = TRUE);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bp_readings_updated_at BEFORE UPDATE ON blood_pressure_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_entries_updated_at BEFORE UPDATE ON symptom_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_entries_updated_at BEFORE UPDATE ON medication_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, action, old_values, ip_address)
        VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), inet_client_addr());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, action, old_values, new_values, ip_address)
        VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, action, new_values, ip_address)
        VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), inet_client_addr());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_blood_pressure_readings AFTER INSERT OR UPDATE OR DELETE ON blood_pressure_readings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_symptom_entries AFTER INSERT OR UPDATE OR DELETE ON symptom_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_medication_entries AFTER INSERT OR UPDATE OR DELETE ON medication_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();