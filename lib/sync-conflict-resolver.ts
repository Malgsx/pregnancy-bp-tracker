import { 
  OfflineRecord, 
  BloodPressureReading, 
  SymptomEntry, 
  MedicationEntry 
} from '@/lib/database.types'
import { getDatabase } from '@/lib/database'

export type ConflictResolution = 'local' | 'server' | 'merge'

export interface ConflictDetails {
  recordId: string
  table: string
  localData: any
  serverData: any
  conflictType: 'update' | 'delete' | 'concurrent_edit'
  timestamp: string
  fields: string[]
}

export class SyncConflictResolver {
  private db = getDatabase()

  // ==================== CONFLICT DETECTION ====================

  async detectConflicts(
    localRecord: OfflineRecord,
    serverRecord: any
  ): Promise<ConflictDetails | null> {
    if (!serverRecord) {
      return null // No conflict if server record doesn't exist
    }

    const conflicts: string[] = []
    const localData = localRecord.data
    const serverData = serverRecord

    // Check timestamps
    const localUpdated = new Date(localData.updated_at || localData.created_at)
    const serverUpdated = new Date(serverData.updated_at || serverData.created_at)

    // If server was updated after local record was created, we have a conflict
    if (serverUpdated > localUpdated) {
      // Compare specific fields based on table type
      switch (localRecord.table) {
        case 'blood_pressure_readings':
          conflicts.push(...this.compareBloodPressureFields(localData, serverData))
          break
        case 'symptom_entries':
          conflicts.push(...this.compareSymptomFields(localData, serverData))
          break
        case 'medication_entries':
          conflicts.push(...this.compareMedicationFields(localData, serverData))
          break
      }

      if (conflicts.length > 0) {
        return {
          recordId: localRecord.id,
          table: localRecord.table,
          localData,
          serverData,
          conflictType: localRecord.action === 'DELETE' ? 'delete' : 'concurrent_edit',
          timestamp: new Date().toISOString(),
          fields: conflicts
        }
      }
    }

    return null
  }

  private compareBloodPressureFields(local: any, server: any): string[] {
    const conflicts: string[] = []
    const fieldsToCheck = [
      'systolic', 'diastolic', 'heart_rate', 'reading_time', 
      'position', 'arm_used', 'notes', 'stress_level', 'sleep_hours'
    ]

    fieldsToCheck.forEach(field => {
      if (local[field] !== server[field]) {
        conflicts.push(field)
      }
    })

    return conflicts
  }

  private compareSymptomFields(local: any, server: any): string[] {
    const conflicts: string[] = []
    const fieldsToCheck = [
      'symptom_id', 'custom_symptom_name', 'severity', 
      'duration_minutes', 'notes', 'occurred_at'
    ]

    fieldsToCheck.forEach(field => {
      if (local[field] !== server[field]) {
        conflicts.push(field)
      }
    })

    return conflicts
  }

  private compareMedicationFields(local: any, server: any): string[] {
    const conflicts: string[] = []
    const fieldsToCheck = [
      'medication_id', 'custom_medication_name', 'dosage', 
      'dosage_unit', 'frequency', 'taken_at', 'prescribed_by'
    ]

    fieldsToCheck.forEach(field => {
      if (local[field] !== server[field]) {
        conflicts.push(field)
      }
    })

    return conflicts
  }

  // ==================== CONFLICT RESOLUTION ====================

  async resolveConflict(
    conflict: ConflictDetails,
    resolution: ConflictResolution,
    customMergeFields?: Partial<any>
  ): Promise<{ success: boolean; resolvedData?: any; error?: string }> {
    try {
      let resolvedData: any

      switch (resolution) {
        case 'local':
          resolvedData = await this.resolveWithLocal(conflict)
          break
        case 'server':
          resolvedData = await this.resolveWithServer(conflict)
          break
        case 'merge':
          resolvedData = await this.resolveWithMerge(conflict, customMergeFields)
          break
        default:
          return { success: false, error: 'Invalid resolution strategy' }
      }

      return { success: true, resolvedData }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Resolution failed' 
      }
    }
  }

  private async resolveWithLocal(conflict: ConflictDetails): Promise<any> {
    // Use local version - overwrite server
    const updateData = {
      ...conflict.localData,
      updated_at: new Date().toISOString(),
      sync_status: 'synced'
    }

    let result
    switch (conflict.table) {
      case 'blood_pressure_readings':
        result = await this.db.updateBloodPressureReading(conflict.localData.id, updateData)
        break
      case 'symptom_entries':
        result = await this.db.updateSymptomEntry(conflict.localData.id, updateData)
        break
      case 'medication_entries':
        result = await this.db.updateMedicationEntry(conflict.localData.id, updateData)
        break
      default:
        throw new Error('Unsupported table for conflict resolution')
    }

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  }

  private async resolveWithServer(conflict: ConflictDetails): Promise<any> {
    // Use server version - discard local changes
    return conflict.serverData
  }

  private async resolveWithMerge(
    conflict: ConflictDetails, 
    customMergeFields?: Partial<any>
  ): Promise<any> {
    // Intelligent merge strategy
    let mergedData = { ...conflict.serverData }

    // Apply custom merge fields if provided
    if (customMergeFields) {
      Object.assign(mergedData, customMergeFields)
    } else {
      // Default merge logic based on data types
      switch (conflict.table) {
        case 'blood_pressure_readings':
          mergedData = this.mergeBloodPressureData(conflict)
          break
        case 'symptom_entries':
          mergedData = this.mergeSymptomData(conflict)
          break
        case 'medication_entries':
          mergedData = this.mergeMedicationData(conflict)
          break
      }
    }

    mergedData.updated_at = new Date().toISOString()
    mergedData.sync_status = 'synced'

    // Update with merged data
    let result
    switch (conflict.table) {
      case 'blood_pressure_readings':
        result = await this.db.updateBloodPressureReading(mergedData.id, mergedData)
        break
      case 'symptom_entries':
        result = await this.db.updateSymptomEntry(mergedData.id, mergedData)
        break
      case 'medication_entries':
        result = await this.db.updateMedicationEntry(mergedData.id, mergedData)
        break
      default:
        throw new Error('Unsupported table for conflict resolution')
    }

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  }

  // ==================== MERGE STRATEGIES ====================

  private mergeBloodPressureData(conflict: ConflictDetails): any {
    const { localData, serverData } = conflict
    const merged = { ...serverData }

    // Merge strategy: prefer most recent clinical data
    const localTime = new Date(localData.reading_time)
    const serverTime = new Date(serverData.reading_time)

    // If local reading is more recent, use local clinical values
    if (localTime > serverTime) {
      merged.systolic = localData.systolic
      merged.diastolic = localData.diastolic
      merged.heart_rate = localData.heart_rate
      merged.reading_time = localData.reading_time
    }

    // Always merge notes (combine both)
    if (localData.notes && serverData.notes && localData.notes !== serverData.notes) {
      merged.notes = `${serverData.notes}\n\n[Local update]: ${localData.notes}`
    } else if (localData.notes) {
      merged.notes = localData.notes
    }

    // Merge context data (prefer local as it's more recent user input)
    if (localData.stress_level !== null) merged.stress_level = localData.stress_level
    if (localData.sleep_hours !== null) merged.sleep_hours = localData.sleep_hours
    if (localData.activity_before_reading) merged.activity_before_reading = localData.activity_before_reading

    return merged
  }

  private mergeSymptomData(conflict: ConflictDetails): any {
    const { localData, serverData } = conflict
    const merged = { ...serverData }

    // For symptoms, prefer local user input as it's more accurate
    merged.severity = localData.severity || serverData.severity
    merged.duration_minutes = localData.duration_minutes || serverData.duration_minutes

    // Merge notes
    if (localData.notes && serverData.notes && localData.notes !== serverData.notes) {
      merged.notes = `${serverData.notes}\n\n[Updated]: ${localData.notes}`
    } else if (localData.notes) {
      merged.notes = localData.notes
    }

    return merged
  }

  private mergeMedicationData(conflict: ConflictDetails): any {
    const { localData, serverData } = conflict
    const merged = { ...serverData }

    // For medications, prefer local data for user-reported fields
    merged.taken_with_food = localData.taken_with_food ?? serverData.taken_with_food
    merged.side_effects = localData.side_effects || serverData.side_effects
    merged.effectiveness_rating = localData.effectiveness_rating || serverData.effectiveness_rating

    // Merge side effects
    if (localData.side_effects && serverData.side_effects && localData.side_effects !== serverData.side_effects) {
      merged.side_effects = `${serverData.side_effects}\n\n[Additional]: ${localData.side_effects}`
    }

    return merged
  }

  // ==================== CONFLICT RESOLUTION UI HELPERS ====================

  generateConflictSummary(conflict: ConflictDetails): {
    title: string
    description: string
    recommendations: { strategy: ConflictResolution; reason: string; confidence: number }[]
  } {
    const fieldCount = conflict.fields.length
    const table = conflict.table.replace('_', ' ')

    const title = `Sync Conflict in ${table}`
    const description = `Your local changes conflict with server updates in ${fieldCount} field${fieldCount > 1 ? 's' : ''}: ${conflict.fields.join(', ')}`

    const recommendations = this.generateRecommendations(conflict)

    return { title, description, recommendations }
  }

  private generateRecommendations(conflict: ConflictDetails): { strategy: ConflictResolution; reason: string; confidence: number }[] {
    const recommendations: { strategy: ConflictResolution; reason: string; confidence: number }[] = []

    // Analyze conflict characteristics
    const hasNotes = conflict.fields.includes('notes')
    const hasTimestamp = conflict.fields.includes('reading_time') || conflict.fields.includes('occurred_at') || conflict.fields.includes('taken_at')
    const hasClinicalData = ['systolic', 'diastolic', 'heart_rate', 'severity', 'dosage'].some(field => 
      conflict.fields.includes(field)
    )

    // Generate recommendations based on conflict type
    if (hasClinicalData && hasTimestamp) {
      recommendations.push({
        strategy: 'merge',
        reason: 'Combines clinical data with user context',
        confidence: 90
      })
      recommendations.push({
        strategy: 'local',
        reason: 'Your recent changes include important clinical data',
        confidence: 75
      })
    } else if (hasNotes) {
      recommendations.push({
        strategy: 'merge',
        reason: 'Preserves both sets of notes and context',
        confidence: 85
      })
    } else {
      recommendations.push({
        strategy: 'local',
        reason: 'Your recent changes should take precedence',
        confidence: 80
      })
      recommendations.push({
        strategy: 'server',
        reason: 'Use the server version to maintain consistency',
        confidence: 60
      })
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }
}

// Export singleton instance
export const conflictResolver = new SyncConflictResolver()

// Hook for React components
export function useConflictResolver() {
  return conflictResolver
}