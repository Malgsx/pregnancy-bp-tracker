import { v4 as uuidv4 } from 'uuid'
import { 
  OfflineRecord, 
  SyncResult,
  BloodPressureReadingInsert,
  SymptomEntryInsert,
  MedicationEntryInsert,
  ApiResponse
} from '@/lib/database.types'
import { getDatabase } from '@/lib/database'
import { 
  validateBloodPressureReading,
  validateSymptomEntry,
  validateMedicationEntry 
} from '@/lib/validations'

// Storage keys
const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'bp_tracker_offline_queue',
  LAST_SYNC: 'bp_tracker_last_sync',
  OFFLINE_DATA: 'bp_tracker_offline_data',
  SYNC_STATUS: 'bp_tracker_sync_status'
} as const

// Network status monitoring
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
let networkListeners: (() => void)[] = []

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true
    networkListeners.forEach(listener => listener())
  })

  window.addEventListener('offline', () => {
    isOnline = false
  })
}

export class OfflineStorageManager {
  private userId: string
  private syncInProgress = false
  private db = getDatabase()

  constructor(userId: string) {
    this.userId = userId
  }

  // ==================== OFFLINE QUEUE MANAGEMENT ====================

  private getOfflineQueue(): OfflineRecord[] {
    try {
      const queue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)
      return queue ? JSON.parse(queue) : []
    } catch (error) {
      console.error('Failed to read offline queue:', error)
      return []
    }
  }

  private saveOfflineQueue(queue: OfflineRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  private addToOfflineQueue(record: OfflineRecord): void {
    const queue = this.getOfflineQueue()
    queue.push(record)
    this.saveOfflineQueue(queue)
  }

  private removeFromOfflineQueue(recordId: string): void {
    const queue = this.getOfflineQueue().filter(record => record.id !== recordId)
    this.saveOfflineQueue(queue)
  }

  // ==================== OFFLINE DATA STORAGE ====================

  private getOfflineData(table: string): any[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.OFFLINE_DATA}_${table}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Failed to read offline data for ${table}:`, error)
      return []
    }
  }

  private saveOfflineData(table: string, data: any[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.OFFLINE_DATA}_${table}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Failed to save offline data for ${table}:`, error)
    }
  }

  private addToOfflineData(table: string, record: any): void {
    const data = this.getOfflineData(table)
    const existingIndex = data.findIndex(item => item.local_id === record.local_id)
    
    if (existingIndex !== -1) {
      data[existingIndex] = { ...data[existingIndex], ...record }
    } else {
      data.push(record)
    }
    
    this.saveOfflineData(table, data)
  }

  private removeFromOfflineData(table: string, localId: string): void {
    const data = this.getOfflineData(table).filter(item => item.local_id !== localId)
    this.saveOfflineData(table, data)
  }

  // ==================== OFFLINE CRUD OPERATIONS ====================

  async createBloodPressureReadingOffline(reading: BloodPressureReadingInsert): Promise<ApiResponse<any>> {
    try {
      // Validate data first
      const validation = validateBloodPressureReading(reading)
      if (!validation.success) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid blood pressure reading data',
            details: validation.error.issues || null,
            timestamp: new Date().toISOString()
          },
          status: 'error'
        }
      }

      const localId = uuidv4()
      const offlineReading = {
        ...reading,
        id: uuidv4(), // Temporary ID for offline use
        local_id: localId,
        sync_status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_manual_entry: true,
        is_deleted: false,
        medication_taken: reading.medication_taken || false,
        felt_symptoms: reading.felt_symptoms || false,
        created_by: 'user'
      }

      // Store in offline data
      this.addToOfflineData('blood_pressure_readings', offlineReading)

      // Add to sync queue
      const queueRecord: OfflineRecord = {
        id: localId,
        table: 'blood_pressure_readings',
        action: 'INSERT',
        data: offlineReading,
        timestamp: new Date().toISOString(),
        synced: false
      }

      this.addToOfflineQueue(queueRecord)

      // Try to sync if online
      if (isOnline) {
        this.syncOfflineData()
      }

      return {
        data: offlineReading,
        error: null,
        status: 'success'
      }
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'OFFLINE_STORAGE_ERROR',
          message: 'Failed to store reading offline',
          details: error,
          timestamp: new Date().toISOString()
        },
        status: 'error'
      }
    }
  }

  async createSymptomEntryOffline(entry: SymptomEntryInsert): Promise<ApiResponse<any>> {
    try {
      const validation = validateSymptomEntry(entry)
      if (!validation.success) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid symptom entry data',
            details: validation.error.issues || null,
            timestamp: new Date().toISOString()
          },
          status: 'error'
        }
      }

      const localId = uuidv4()
      const offlineEntry = {
        ...entry,
        id: uuidv4(),
        local_id: localId,
        sync_status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        occurred_at: entry.occurred_at || new Date().toISOString(),
        is_deleted: false
      }

      this.addToOfflineData('symptom_entries', offlineEntry)

      const queueRecord: OfflineRecord = {
        id: localId,
        table: 'symptom_entries',
        action: 'INSERT',
        data: offlineEntry,
        timestamp: new Date().toISOString(),
        synced: false
      }

      this.addToOfflineQueue(queueRecord)

      if (isOnline) {
        this.syncOfflineData()
      }

      return {
        data: offlineEntry,
        error: null,
        status: 'success'
      }
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'OFFLINE_STORAGE_ERROR',
          message: 'Failed to store symptom entry offline',
          details: error,
          timestamp: new Date().toISOString()
        },
        status: 'error'
      }
    }
  }

  async createMedicationEntryOffline(entry: MedicationEntryInsert): Promise<ApiResponse<any>> {
    try {
      const validation = validateMedicationEntry(entry)
      if (!validation.success) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid medication entry data',
            details: validation.error.issues || null,
            timestamp: new Date().toISOString()
          },
          status: 'error'
        }
      }

      const localId = uuidv4()
      const offlineEntry = {
        ...entry,
        id: uuidv4(),
        local_id: localId,
        sync_status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        taken_at: entry.taken_at || new Date().toISOString(),
        is_deleted: false,
        missed_dose: entry.missed_dose || false,
        dosage_unit: entry.dosage_unit || 'mg',
        route: entry.route || 'oral'
      }

      this.addToOfflineData('medication_entries', offlineEntry)

      const queueRecord: OfflineRecord = {
        id: localId,
        table: 'medication_entries',
        action: 'INSERT',
        data: offlineEntry,
        timestamp: new Date().toISOString(),
        synced: false
      }

      this.addToOfflineQueue(queueRecord)

      if (isOnline) {
        this.syncOfflineData()
      }

      return {
        data: offlineEntry,
        error: null,
        status: 'success'
      }
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'OFFLINE_STORAGE_ERROR',
          message: 'Failed to store medication entry offline',
          details: error,
          timestamp: new Date().toISOString()
        },
        status: 'error'
      }
    }
  }

  // ==================== DATA RETRIEVAL ====================

  getOfflineBloodPressureReadings(): any[] {
    return this.getOfflineData('blood_pressure_readings')
      .filter(reading => !reading.is_deleted)
      .sort((a, b) => new Date(b.reading_time).getTime() - new Date(a.reading_time).getTime())
  }

  getOfflineSymptomEntries(): any[] {
    return this.getOfflineData('symptom_entries')
      .filter(entry => !entry.is_deleted)
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
  }

  getOfflineMedicationEntries(): any[] {
    return this.getOfflineData('medication_entries')
      .filter(entry => !entry.is_deleted)
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())
  }

  // ==================== SYNCHRONIZATION ====================

  async syncOfflineData(): Promise<SyncResult> {
    if (this.syncInProgress || !isOnline) {
      return {
        success: false,
        conflicts: [],
        synced: [],
        errors: [{ 
          record: {} as OfflineRecord, 
          error: this.syncInProgress ? 'Sync already in progress' : 'Device is offline' 
        }]
      }
    }

    this.syncInProgress = true
    const queue = this.getOfflineQueue()
    const result: SyncResult = {
      success: true,
      conflicts: [],
      synced: [],
      errors: []
    }

    try {
      for (const record of queue) {
        try {
          let syncResult: ApiResponse<any> | null = null

          switch (record.table) {
            case 'blood_pressure_readings':
              if (record.action === 'INSERT') {
                syncResult = await this.db.createBloodPressureReading(record.data)
              } else if (record.action === 'UPDATE') {
                syncResult = await this.db.updateBloodPressureReading(record.data.id, record.data)
              } else if (record.action === 'DELETE') {
                syncResult = await this.db.deleteBloodPressureReading(record.data.id)
              }
              break

            case 'symptom_entries':
              if (record.action === 'INSERT') {
                syncResult = await this.db.createSymptomEntry(record.data)
              } else if (record.action === 'UPDATE') {
                syncResult = await this.db.updateSymptomEntry(record.data.id, record.data)
              } else if (record.action === 'DELETE') {
                syncResult = await this.db.deleteSymptomEntry(record.data.id)
              }
              break

            case 'medication_entries':
              if (record.action === 'INSERT') {
                syncResult = await this.db.createMedicationEntry(record.data)
              } else if (record.action === 'UPDATE') {
                syncResult = await this.db.updateMedicationEntry(record.data.id, record.data)
              } else if (record.action === 'DELETE') {
                syncResult = await this.db.deleteMedicationEntry(record.data.id)
              }
              break
          }

          if (syncResult?.status === 'success') {
            // Sync successful
            record.synced = true
            result.synced.push(record)
            this.removeFromOfflineQueue(record.id)

            // Update offline data with server response
            if (syncResult.data && record.action === 'INSERT') {
              this.removeFromOfflineData(record.table, record.data.local_id)
            }
          } else {
            // Sync failed - could be a conflict or error
            if (syncResult?.error?.code === 'CONFLICT') {
              record.conflict = true
              result.conflicts.push(record)
            } else {
              result.errors.push({ 
                record, 
                error: syncResult?.error?.message || 'Unknown sync error' 
              })
            }
          }
        } catch (error) {
          result.errors.push({ 
            record, 
            error: error instanceof Error ? error.message : 'Sync operation failed' 
          })
        }
      }

      // Update last sync timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())

      // Set overall success based on results
      result.success = result.errors.length === 0

    } catch (error) {
      result.success = false
      result.errors.push({ 
        record: {} as OfflineRecord, 
        error: error instanceof Error ? error.message : 'Sync process failed' 
      })
    } finally {
      this.syncInProgress = false
    }

    return result
  }

  // ==================== CONFLICT RESOLUTION ====================

  async resolveConflict(record: OfflineRecord, resolution: 'local' | 'server'): Promise<boolean> {
    try {
      if (resolution === 'server') {
        // Accept server version - remove from offline storage
        this.removeFromOfflineQueue(record.id)
        this.removeFromOfflineData(record.table, record.data.local_id)
        return true
      } else {
        // Keep local version - retry sync with force flag
        record.conflict = false
        const queue = this.getOfflineQueue()
        const recordIndex = queue.findIndex(r => r.id === record.id)
        if (recordIndex !== -1) {
          queue[recordIndex] = record
          this.saveOfflineQueue(queue)
        }
        
        // Retry sync for this specific record
        return await this.syncSingleRecord(record)
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      return false
    }
  }

  private async syncSingleRecord(record: OfflineRecord): Promise<boolean> {
    try {
      // Implementation similar to syncOfflineData but for single record
      // This would force update the server with local data
      return true
    } catch (error) {
      console.error('Failed to sync single record:', error)
      return false
    }
  }

  // ==================== STATUS AND UTILITIES ====================

  getPendingSyncCount(): number {
    return this.getOfflineQueue().filter(record => !record.synced).length
  }

  getLastSyncTime(): Date | null {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    return timestamp ? new Date(timestamp) : null
  }

  isOnline(): boolean {
    return isOnline
  }

  onNetworkStatusChange(callback: () => void): () => void {
    networkListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      networkListeners = networkListeners.filter(listener => listener !== callback)
    }
  }

  // Clear all offline data (use with caution)
  clearOfflineData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Also clear table-specific data
    const tables = ['blood_pressure_readings', 'symptom_entries', 'medication_entries']
    tables.forEach(table => {
      localStorage.removeItem(`${STORAGE_KEYS.OFFLINE_DATA}_${table}`)
    })
  }

  // Export offline data for backup
  exportOfflineData(): any {
    return {
      queue: this.getOfflineQueue(),
      bloodPressureReadings: this.getOfflineBloodPressureReadings(),
      symptomEntries: this.getOfflineSymptomEntries(),
      medicationEntries: this.getOfflineMedicationEntries(),
      lastSync: this.getLastSyncTime()
    }
  }
}

// Singleton instance
let offlineManager: OfflineStorageManager | null = null

export function getOfflineStorage(userId: string): OfflineStorageManager {
  if (!offlineManager || (offlineManager as any).userId !== userId) {
    offlineManager = new OfflineStorageManager(userId)
  }
  return offlineManager
}

export default OfflineStorageManager