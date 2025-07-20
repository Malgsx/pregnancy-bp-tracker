export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums and constants
export type SyncStatus = 'pending' | 'synced' | 'conflict'
export type SymptomCategory = 'physical' | 'emotional' | 'pregnancy-specific' | 'cardiovascular'
export type MedicationCategory = 'antihypertensive' | 'prenatal' | 'supplement' | 'other'
export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X'
export type Position = 'sitting' | 'lying' | 'standing'
export type ArmUsed = 'left' | 'right'
export type MedicationRoute = 'oral' | 'injection' | 'topical' | 'other'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone_number: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          healthcare_provider_name: string | null
          healthcare_provider_phone: string | null
          healthcare_provider_address: string | null
          due_date: string | null
          pregnancy_start_date: string | null
          pregnancy_weeks: number | null
          bp_target_systolic: number | null
          bp_target_diastolic: number | null
          medical_history: Json
          risk_factors: string[] | null
          timezone: string
          measurement_unit: string
          notification_preferences: Json
          consent_given: boolean
          consent_date: string | null
          data_sharing_consent: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          healthcare_provider_name?: string | null
          healthcare_provider_phone?: string | null
          healthcare_provider_address?: string | null
          due_date?: string | null
          pregnancy_start_date?: string | null
          bp_target_systolic?: number | null
          bp_target_diastolic?: number | null
          medical_history?: Json
          risk_factors?: string[] | null
          timezone?: string
          measurement_unit?: string
          notification_preferences?: Json
          consent_given?: boolean
          consent_date?: string | null
          data_sharing_consent?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          healthcare_provider_name?: string | null
          healthcare_provider_phone?: string | null
          healthcare_provider_address?: string | null
          due_date?: string | null
          pregnancy_start_date?: string | null
          bp_target_systolic?: number | null
          bp_target_diastolic?: number | null
          medical_history?: Json
          risk_factors?: string[] | null
          timezone?: string
          measurement_unit?: string
          notification_preferences?: Json
          consent_given?: boolean
          consent_date?: string | null
          data_sharing_consent?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      symptoms: {
        Row: {
          id: string
          name: string
          category: SymptomCategory
          description: string | null
          severity_scale: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: SymptomCategory
          description?: string | null
          severity_scale?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: SymptomCategory
          description?: string | null
          severity_scale?: number
          is_active?: boolean
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          name: string
          generic_name: string | null
          category: MedicationCategory
          dosage_forms: string[] | null
          pregnancy_category: PregnancyCategory | null
          common_dosages: string[] | null
          description: string | null
          warnings: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_name?: string | null
          category: MedicationCategory
          dosage_forms?: string[] | null
          pregnancy_category?: PregnancyCategory | null
          common_dosages?: string[] | null
          description?: string | null
          warnings?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_name?: string | null
          category?: MedicationCategory
          dosage_forms?: string[] | null
          pregnancy_category?: PregnancyCategory | null
          common_dosages?: string[] | null
          description?: string | null
          warnings?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      blood_pressure_readings: {
        Row: {
          id: string
          user_id: string
          systolic: number
          diastolic: number
          heart_rate: number | null
          reading_time: string
          position: Position | null
          arm_used: ArmUsed | null
          device_used: string | null
          weight_kg: number | null
          notes: string | null
          activity_before_reading: string | null
          stress_level: number | null
          sleep_hours: number | null
          medication_taken: boolean
          felt_symptoms: boolean
          is_manual_entry: boolean
          is_deleted: boolean
          sync_status: SyncStatus
          local_id: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          user_id: string
          systolic: number
          diastolic: number
          heart_rate?: number | null
          reading_time: string
          position?: Position | null
          arm_used?: ArmUsed | null
          device_used?: string | null
          weight_kg?: number | null
          notes?: string | null
          activity_before_reading?: string | null
          stress_level?: number | null
          sleep_hours?: number | null
          medication_taken?: boolean
          felt_symptoms?: boolean
          is_manual_entry?: boolean
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          user_id?: string
          systolic?: number
          diastolic?: number
          heart_rate?: number | null
          reading_time?: string
          position?: Position | null
          arm_used?: ArmUsed | null
          device_used?: string | null
          weight_kg?: number | null
          notes?: string | null
          activity_before_reading?: string | null
          stress_level?: number | null
          sleep_hours?: number | null
          medication_taken?: boolean
          felt_symptoms?: boolean
          is_manual_entry?: boolean
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      symptom_entries: {
        Row: {
          id: string
          user_id: string
          reading_id: string | null
          symptom_id: string | null
          custom_symptom_name: string | null
          severity: number | null
          duration_minutes: number | null
          notes: string | null
          occurred_at: string
          is_deleted: boolean
          sync_status: SyncStatus
          local_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reading_id?: string | null
          symptom_id?: string | null
          custom_symptom_name?: string | null
          severity?: number | null
          duration_minutes?: number | null
          notes?: string | null
          occurred_at?: string
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reading_id?: string | null
          symptom_id?: string | null
          custom_symptom_name?: string | null
          severity?: number | null
          duration_minutes?: number | null
          notes?: string | null
          occurred_at?: string
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medication_entries: {
        Row: {
          id: string
          user_id: string
          reading_id: string | null
          medication_id: string | null
          custom_medication_name: string | null
          dosage: string
          dosage_unit: string
          frequency: string | null
          route: MedicationRoute
          taken_at: string
          prescribed_by: string | null
          taken_with_food: boolean | null
          missed_dose: boolean
          side_effects: string | null
          effectiveness_rating: number | null
          is_deleted: boolean
          sync_status: SyncStatus
          local_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reading_id?: string | null
          medication_id?: string | null
          custom_medication_name?: string | null
          dosage: string
          dosage_unit?: string
          frequency?: string | null
          route?: MedicationRoute
          taken_at?: string
          prescribed_by?: string | null
          taken_with_food?: boolean | null
          missed_dose?: boolean
          side_effects?: string | null
          effectiveness_rating?: number | null
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reading_id?: string | null
          medication_id?: string | null
          custom_medication_name?: string | null
          dosage?: string
          dosage_unit?: string
          frequency?: string | null
          route?: MedicationRoute
          taken_at?: string
          prescribed_by?: string | null
          taken_with_food?: boolean | null
          missed_dose?: boolean
          side_effects?: string | null
          effectiveness_rating?: number | null
          is_deleted?: boolean
          sync_status?: SyncStatus
          local_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          location: Json | null
          login_at: string
          logout_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          location?: Json | null
          login_at?: string
          logout_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          location?: Json | null
          login_at?: string
          logout_at?: string | null
          is_active?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          table_name: string
          record_id: string | null
          action: AuditAction
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          table_name: string
          record_id?: string | null
          action: AuditAction
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          table_name?: string
          record_id?: string | null
          action?: AuditAction
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for application use
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']
export type BloodPressureReadingInsert = Database['public']['Tables']['blood_pressure_readings']['Insert']
export type BloodPressureReadingUpdate = Database['public']['Tables']['blood_pressure_readings']['Update']

export type SymptomEntry = Database['public']['Tables']['symptom_entries']['Row']
export type SymptomEntryInsert = Database['public']['Tables']['symptom_entries']['Insert']
export type SymptomEntryUpdate = Database['public']['Tables']['symptom_entries']['Update']

export type MedicationEntry = Database['public']['Tables']['medication_entries']['Row']
export type MedicationEntryInsert = Database['public']['Tables']['medication_entries']['Insert']
export type MedicationEntryUpdate = Database['public']['Tables']['medication_entries']['Update']

export type Symptom = Database['public']['Tables']['symptoms']['Row']
export type Medication = Database['public']['Tables']['medications']['Row']

export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Enhanced types for application logic
export interface BloodPressureReadingWithRelations extends BloodPressureReading {
  symptom_entries?: (SymptomEntry & { symptom?: Symptom })[]
  medication_entries?: (MedicationEntry & { medication?: Medication })[]
}

export interface SymptomEntryWithRelations extends SymptomEntry {
  symptom?: Symptom
  blood_pressure_reading?: BloodPressureReading
}

export interface MedicationEntryWithRelations extends MedicationEntry {
  medication?: Medication
  blood_pressure_reading?: BloodPressureReading
}

// Data validation interfaces
export interface BloodPressureValidation {
  systolic: { min: 70, max: 250 }
  diastolic: { min: 40, max: 150 }
  heart_rate: { min: 40, max: 200 }
  stress_level: { min: 1, max: 10 }
  sleep_hours: { min: 0, max: 24 }
  weight_kg: { min: 30, max: 300 }
}

export interface SymptomValidation {
  severity: { min: 1, max: 10 }
  duration_minutes: { min: 1, max: 1440 } // Max 24 hours
}

export interface MedicationValidation {
  effectiveness_rating: { min: 1, max: 5 }
}

// Offline sync types
export interface OfflineRecord {
  id: string
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  data: any
  timestamp: string
  synced: boolean
  conflict?: boolean
}

export interface SyncResult {
  success: boolean
  conflicts: OfflineRecord[]
  synced: OfflineRecord[]
  errors: { record: OfflineRecord; error: string }[]
}

// HIPAA compliance types
export interface HIPAAAccessLog {
  user_id: string
  action: string
  resource: string
  timestamp: string
  ip_address?: string
  result: 'success' | 'failure'
  reason?: string
}

// Analytics and reporting types
export interface BloodPressureStats {
  average_systolic: number
  average_diastolic: number
  average_heart_rate: number
  readings_count: number
  high_readings_count: number
  period_start: string
  period_end: string
}

export interface TrendData {
  date: string
  systolic: number
  diastolic: number
  heart_rate?: number
}

// Error types
export interface DatabaseError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: DatabaseError | null
  count?: number
  status: 'success' | 'error'
}

// Real-time subscription types
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
  table: string
  timestamp: string
}