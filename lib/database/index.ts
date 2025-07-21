import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import {
  Database,
  BloodPressureReading,
  BloodPressureReadingInsert,
  BloodPressureReadingUpdate,
  BloodPressureReadingWithRelations,
  SymptomEntry,
  SymptomEntryInsert,
  SymptomEntryUpdate,
  MedicationEntry,
  MedicationEntryInsert,
  MedicationEntryUpdate,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  Symptom,
  Medication,
  ApiResponse,
  DatabaseError,
  BloodPressureStats,
  TrendData,
  RealtimePayload
} from '@/lib/database.types'
import {
  bloodPressureReadingInsertSchema,
  bloodPressureReadingUpdateSchema,
  symptomEntryInsertSchema,
  symptomEntryUpdateSchema,
  medicationEntryInsertSchema,
  medicationEntryUpdateSchema,
  userProfileInsertSchema,
  userProfileUpdateSchema,
  formatValidationErrors
} from '@/lib/validations'

// Database service class for HIPAA-compliant operations
export class DatabaseService {
  private supabase: SupabaseClient<Database>
  private realtimeChannels: Map<string, RealtimeChannel> = new Map()

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  // Error handling helper
  private handleError(error: any, operation: string, data?: any): DatabaseError {
    console.error(`Database operation failed: ${operation}`, {
      error,
      data,
      timestamp: new Date().toISOString()
    })

    return {
      code: error?.code || 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: error?.details || null,
      timestamp: new Date().toISOString()
    }
  }

  // Success response helper
  private successResponse<T>(data: T, count?: number): ApiResponse<T> {
    return {
      data,
      error: null,
      count,
      status: 'success'
    }
  }

  // Error response helper
  private errorResponse<T>(error: DatabaseError): ApiResponse<T> {
    return {
      data: null,
      error,
      status: 'error'
    }
  }

  // ==================== AUDIT LOGGING ====================

  async insertAuditLog(logData: {
    user_id: string
    table_name: string
    record_id?: string
    action: string
    old_values?: any
    new_values?: any
    ip_address?: string
    user_agent?: string
    timestamp: string
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert(logData)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'insertAuditLog', logData))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'insertAuditLog', logData))
    }
  }

  async getAuditLogs(params: {
    userId?: string
    startDate?: string
    endDate?: string
    actions?: string[]
    limit?: number
  }): Promise<ApiResponse<any[]>> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (params.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate)
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate)
      }

      if (params.actions && params.actions.length > 0) {
        query = query.in('action', params.actions)
      }

      if (params.limit) {
        query = query.limit(params.limit)
      }

      const { data, error } = await query

      if (error) {
        return this.errorResponse(this.handleError(error, 'getAuditLogs', params))
      }

      return this.successResponse(data || [])
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getAuditLogs', params))
    }
  }

  // ==================== USER PROFILES ====================

  async createUserProfile(profile: UserProfileInsert): Promise<ApiResponse<UserProfile>> {
    try {
      const validation = userProfileInsertSchema.safeParse(profile)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'createUserProfile', profile))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'createUserProfile', profile))
    }
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'getUserProfile', { userId }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getUserProfile', { userId }))
    }
  }

  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<ApiResponse<UserProfile>> {
    try {
      const validation = userProfileUpdateSchema.safeParse(updates)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile update data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'updateUserProfile', { userId, updates }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'updateUserProfile', { userId, updates }))
    }
  }

  // ==================== BLOOD PRESSURE READINGS ====================

  async createBloodPressureReading(reading: BloodPressureReadingInsert): Promise<ApiResponse<BloodPressureReading>> {
    try {
      const validation = bloodPressureReadingInsertSchema.safeParse(reading)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid blood pressure reading data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      // Add local_id if not provided (for offline sync)
      const readingWithId = {
        ...reading,
        local_id: reading.local_id || uuidv4(),
        sync_status: reading.sync_status || 'synced'
      }

      const { data, error } = await this.supabase
        .from('blood_pressure_readings')
        .insert(readingWithId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'createBloodPressureReading', readingWithId))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'createBloodPressureReading', reading))
    }
  }

  async getBloodPressureReadings(
    userId: string,
    options: {
      limit?: number
      offset?: number
      startDate?: string
      endDate?: string
      includeSoftDeleted?: boolean
    } = {}
  ): Promise<ApiResponse<BloodPressureReading[]>> {
    try {
      let query = this.supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('user_id', userId)
        .order('reading_time', { ascending: false })

      if (!options.includeSoftDeleted) {
        query = query.eq('is_deleted', false)
      }

      if (options.startDate) {
        query = query.gte('reading_time', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('reading_time', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        return this.errorResponse(this.handleError(error, 'getBloodPressureReadings', { userId, options }))
      }

      return this.successResponse(data || [], count || undefined)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getBloodPressureReadings', { userId, options }))
    }
  }

  async getBloodPressureReadingWithRelations(readingId: string): Promise<ApiResponse<BloodPressureReadingWithRelations>> {
    try {
      const { data, error } = await this.supabase
        .from('blood_pressure_readings')
        .select(`
          *,
          symptom_entries (
            *,
            symptom:symptoms (*)
          ),
          medication_entries (
            *,
            medication:medications (*)
          )
        `)
        .eq('id', readingId)
        .eq('is_deleted', false)
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'getBloodPressureReadingWithRelations', { readingId }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getBloodPressureReadingWithRelations', { readingId }))
    }
  }

  async updateBloodPressureReading(
    readingId: string,
    updates: BloodPressureReadingUpdate
  ): Promise<ApiResponse<BloodPressureReading>> {
    try {
      const validation = bloodPressureReadingUpdateSchema.safeParse(updates)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid blood pressure reading update data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const { data, error } = await this.supabase
        .from('blood_pressure_readings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', readingId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'updateBloodPressureReading', { readingId, updates }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'updateBloodPressureReading', { readingId, updates }))
    }
  }

  async deleteBloodPressureReading(readingId: string, hardDelete: boolean = false): Promise<ApiResponse<boolean>> {
    try {
      if (hardDelete) {
        const { error } = await this.supabase
          .from('blood_pressure_readings')
          .delete()
          .eq('id', readingId)
      } else {
        // Soft delete
        const { error } = await this.supabase
          .from('blood_pressure_readings')
          .update({ 
            is_deleted: true, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', readingId)

        if (error) {
          return this.errorResponse(this.handleError(error, 'deleteBloodPressureReading', { readingId }))
        }
      }

      return this.successResponse(true)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'deleteBloodPressureReading', { readingId }))
    }
  }

  // ==================== SYMPTOM ENTRIES ====================

  async createSymptomEntry(entry: SymptomEntryInsert): Promise<ApiResponse<SymptomEntry>> {
    try {
      const validation = symptomEntryInsertSchema.safeParse(entry)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid symptom entry data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const entryWithId = {
        ...entry,
        local_id: entry.local_id || uuidv4(),
        sync_status: entry.sync_status || 'synced'
      }

      const { data, error } = await this.supabase
        .from('symptom_entries')
        .insert(entryWithId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'createSymptomEntry', entryWithId))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'createSymptomEntry', entry))
    }
  }

  async getSymptomEntries(
    userId: string,
    options: {
      limit?: number
      readingId?: string
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<ApiResponse<SymptomEntry[]>> {
    try {
      let query = this.supabase
        .from('symptom_entries')
        .select(`
          *,
          symptom:symptoms (*),
          blood_pressure_reading:blood_pressure_readings (*)
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('occurred_at', { ascending: false })

      if (options.readingId) {
        query = query.eq('reading_id', options.readingId)
      }

      if (options.startDate) {
        query = query.gte('occurred_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('occurred_at', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        return this.errorResponse(this.handleError(error, 'getSymptomEntries', { userId, options }))
      }

      return this.successResponse(data || [])
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getSymptomEntries', { userId, options }))
    }
  }

  async updateSymptomEntry(entryId: string, updates: SymptomEntryUpdate): Promise<ApiResponse<SymptomEntry>> {
    try {
      const validation = symptomEntryUpdateSchema.safeParse(updates)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid symptom entry update data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const { data, error } = await this.supabase
        .from('symptom_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'updateSymptomEntry', { entryId, updates }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'updateSymptomEntry', { entryId, updates }))
    }
  }

  async deleteSymptomEntry(entryId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('symptom_entries')
        .update({ 
          is_deleted: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', entryId)

      if (error) {
        return this.errorResponse(this.handleError(error, 'deleteSymptomEntry', { entryId }))
      }

      return this.successResponse(true)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'deleteSymptomEntry', { entryId }))
    }
  }

  // ==================== MEDICATION ENTRIES ====================

  async createMedicationEntry(entry: MedicationEntryInsert): Promise<ApiResponse<MedicationEntry>> {
    try {
      const validation = medicationEntryInsertSchema.safeParse(entry)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid medication entry data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const entryWithId = {
        ...entry,
        local_id: entry.local_id || uuidv4(),
        sync_status: entry.sync_status || 'synced'
      }

      const { data, error } = await this.supabase
        .from('medication_entries')
        .insert(entryWithId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'createMedicationEntry', entryWithId))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'createMedicationEntry', entry))
    }
  }

  async getMedicationEntries(
    userId: string,
    options: {
      limit?: number
      readingId?: string
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<ApiResponse<MedicationEntry[]>> {
    try {
      let query = this.supabase
        .from('medication_entries')
        .select(`
          *,
          medication:medications (*),
          blood_pressure_reading:blood_pressure_readings (*)
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('taken_at', { ascending: false })

      if (options.readingId) {
        query = query.eq('reading_id', options.readingId)
      }

      if (options.startDate) {
        query = query.gte('taken_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('taken_at', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        return this.errorResponse(this.handleError(error, 'getMedicationEntries', { userId, options }))
      }

      return this.successResponse(data || [])
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getMedicationEntries', { userId, options }))
    }
  }

  async updateMedicationEntry(entryId: string, updates: MedicationEntryUpdate): Promise<ApiResponse<MedicationEntry>> {
    try {
      const validation = medicationEntryUpdateSchema.safeParse(updates)
      if (!validation.success) {
        return this.errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Invalid medication entry update data',
          details: formatValidationErrors(validation.error),
          timestamp: new Date().toISOString()
        })
      }

      const { data, error } = await this.supabase
        .from('medication_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(this.handleError(error, 'updateMedicationEntry', { entryId, updates }))
      }

      return this.successResponse(data)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'updateMedicationEntry', { entryId, updates }))
    }
  }

  async deleteMedicationEntry(entryId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('medication_entries')
        .update({ 
          is_deleted: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', entryId)

      if (error) {
        return this.errorResponse(this.handleError(error, 'deleteMedicationEntry', { entryId }))
      }

      return this.successResponse(true)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'deleteMedicationEntry', { entryId }))
    }
  }

  // ==================== REFERENCE DATA ====================

  async getSymptoms(): Promise<ApiResponse<Symptom[]>> {
    try {
      const { data, error } = await this.supabase
        .from('symptoms')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        return this.errorResponse(this.handleError(error, 'getSymptoms'))
      }

      return this.successResponse(data || [])
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getSymptoms'))
    }
  }

  async getMedications(): Promise<ApiResponse<Medication[]>> {
    try {
      const { data, error } = await this.supabase
        .from('medications')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        return this.errorResponse(this.handleError(error, 'getMedications'))
      }

      return this.successResponse(data || [])
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getMedications'))
    }
  }

  // ==================== ANALYTICS & REPORTS ====================

  async getBloodPressureStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<BloodPressureStats>> {
    try {
      const { data, error } = await this.supabase
        .from('blood_pressure_readings')
        .select('systolic, diastolic, heart_rate')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('reading_time', startDate)
        .lte('reading_time', endDate)

      if (error) {
        return this.errorResponse(this.handleError(error, 'getBloodPressureStats', { userId, startDate, endDate }))
      }

      if (!data || data.length === 0) {
        return this.successResponse({
          average_systolic: 0,
          average_diastolic: 0,
          average_heart_rate: 0,
          readings_count: 0,
          high_readings_count: 0,
          period_start: startDate,
          period_end: endDate
        })
      }

      const stats = data.reduce((acc, reading) => {
        acc.systolic_sum += reading.systolic
        acc.diastolic_sum += reading.diastolic
        acc.heart_rate_sum += reading.heart_rate || 0
        acc.heart_rate_count += reading.heart_rate ? 1 : 0
        
        // High BP threshold: >= 140/90
        if (reading.systolic >= 140 || reading.diastolic >= 90) {
          acc.high_readings++
        }
        
        return acc
      }, {
        systolic_sum: 0,
        diastolic_sum: 0,
        heart_rate_sum: 0,
        heart_rate_count: 0,
        high_readings: 0
      })

      const result: BloodPressureStats = {
        average_systolic: Math.round(stats.systolic_sum / data.length),
        average_diastolic: Math.round(stats.diastolic_sum / data.length),
        average_heart_rate: stats.heart_rate_count > 0 ? Math.round(stats.heart_rate_sum / stats.heart_rate_count) : 0,
        readings_count: data.length,
        high_readings_count: stats.high_readings,
        period_start: startDate,
        period_end: endDate
      }

      return this.successResponse(result)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getBloodPressureStats', { userId, startDate, endDate }))
    }
  }

  async getTrendData(
    userId: string,
    days: number = 30
  ): Promise<ApiResponse<TrendData[]>> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

      const { data, error } = await this.supabase
        .from('blood_pressure_readings')
        .select('reading_time, systolic, diastolic, heart_rate')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('reading_time', startDate.toISOString())
        .lte('reading_time', endDate.toISOString())
        .order('reading_time', { ascending: true })

      if (error) {
        return this.errorResponse(this.handleError(error, 'getTrendData', { userId, days }))
      }

      const trendData: TrendData[] = (data || []).map(reading => ({
        date: format(new Date(reading.reading_time), 'yyyy-MM-dd'),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heart_rate: reading.heart_rate || undefined
      }))

      return this.successResponse(trendData)
    } catch (error) {
      return this.errorResponse(this.handleError(error, 'getTrendData', { userId, days }))
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToUserData(
    userId: string,
    callback: (payload: RealtimePayload<any>) => void
  ): () => void {
    const channelName = `user-data-${userId}`
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blood_pressure_readings',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            table: 'blood_pressure_readings',
            timestamp: new Date().toISOString()
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'symptom_entries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            table: 'symptom_entries',
            timestamp: new Date().toISOString()
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_entries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            table: 'medication_entries',
            timestamp: new Date().toISOString()
          })
        }
      )
      .subscribe()

    this.realtimeChannels.set(channelName, channel)

    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(channel)
      this.realtimeChannels.delete(channelName)
    }
  }

  // Clean up all subscriptions
  unsubscribeAll(): void {
    this.realtimeChannels.forEach(channel => {
      this.supabase.removeChannel(channel)
    })
    this.realtimeChannels.clear()
  }
}

// Export singleton instance
let dbInstance: DatabaseService | null = null

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    // HARDCODED CONFIGURATION - bypasses all environment variable issues
    const supabaseUrl = "https://gcbzgtwvuddrmvklkeep.supabase.co"
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYnpndHd2dWRkcm12a2xrZWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDcwNDksImV4cCI6MjA2ODYyMzA0OX0.qgl38DE5QgR5Jp2r-cbKKGsD2P5TzXHB0usmMmhDUsE"
    
    console.log("🔧 Database service using hardcoded Supabase configuration")
    
    dbInstance = new DatabaseService(supabaseUrl, supabaseAnonKey)
  }
  
  return dbInstance
}

export default DatabaseService