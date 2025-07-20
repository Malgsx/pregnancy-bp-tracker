import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '@/lib/database'
import { HIPAAAccessLog, AuditLog } from '@/lib/database.types'

// HIPAA compliance utilities and audit logging
export class HIPAACompliance {
  private static instance: HIPAACompliance | null = null
  private db = getDatabase()

  public static getInstance(): HIPAACompliance {
    if (!HIPAACompliance.instance) {
      HIPAACompliance.instance = new HIPAACompliance()
    }
    return HIPAACompliance.instance
  }

  // ==================== ACCESS LOGGING ====================

  async logDataAccess(params: {
    userId: string
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'
    resource: string
    resourceId?: string
    ipAddress?: string
    userAgent?: string
    result: 'success' | 'failure'
    reason?: string
    additionalData?: any
  }): Promise<void> {
    try {
      const logEntry: HIPAAAccessLog = {
        user_id: params.userId,
        action: params.action,
        resource: params.resource,
        timestamp: new Date().toISOString(),
        ip_address: params.ipAddress,
        result: params.result,
        reason: params.reason
      }

      // Store in audit logs table
      await this.db.insertAuditLog({
        user_id: params.userId,
        table_name: 'access_log',
        record_id: params.resourceId,
        action: 'SELECT',
        new_values: logEntry,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        timestamp: new Date().toISOString()
      })

      console.log('HIPAA Access logged:', logEntry)
    } catch (error) {
      console.error('Failed to log HIPAA access:', error)
      // Don't throw - logging failures shouldn't break the app
    }
  }

  // ==================== DATA ANONYMIZATION ====================

  anonymizeData(data: any, fields: string[]): any {
    if (!data || typeof data !== 'object') return data

    const anonymized = { ...data }
    
    fields.forEach(field => {
      if (field in anonymized) {
        switch (typeof anonymized[field]) {
          case 'string':
            if (field.includes('email')) {
              anonymized[field] = this.anonymizeEmail(anonymized[field])
            } else if (field.includes('phone')) {
              anonymized[field] = this.anonymizePhone(anonymized[field])
            } else if (field.includes('name')) {
              anonymized[field] = this.anonymizeName(anonymized[field])
            } else {
              anonymized[field] = '[REDACTED]'
            }
            break
          case 'number':
            if (field.includes('id')) {
              anonymized[field] = this.generateHashId(anonymized[field])
            } else {
              anonymized[field] = 0
            }
            break
          default:
            anonymized[field] = null
        }
      }
    })

    return anonymized
  }

  private anonymizeEmail(email: string): string {
    if (!email || !email.includes('@')) return '[REDACTED EMAIL]'
    const [username, domain] = email.split('@')
    return `${username.charAt(0)}***@${domain}`
  }

  private anonymizePhone(phone: string): string {
    if (!phone) return '[REDACTED PHONE]'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 4) return '[REDACTED PHONE]'
    return `***-***-${digits.slice(-4)}`
  }

  private anonymizeName(name: string): string {
    if (!name) return '[REDACTED NAME]'
    const parts = name.split(' ')
    return parts.map((part, index) => 
      index === 0 ? `${part.charAt(0)}.` : `${part.charAt(0)}.`
    ).join(' ')
  }

  private generateHashId(id: any): string {
    return `#${Math.abs(String(id).split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`
  }

  // ==================== DATA EXPORT COMPLIANCE ====================

  async createHIPAACompliantExport(params: {
    userId: string
    dataTypes: ('readings' | 'symptoms' | 'medications')[]
    dateRange: { start: string; end: string }
    format: 'json' | 'csv' | 'pdf'
    anonymize?: boolean
    purpose?: string
  }): Promise<{ data: any; exportId: string; compliance: any }> {
    const exportId = uuidv4()
    
    // Log the export request
    await this.logDataAccess({
      userId: params.userId,
      action: 'EXPORT',
      resource: 'health_data',
      resourceId: exportId,
      result: 'success',
      reason: params.purpose || 'User data export'
    })

    const exportData: any = {
      exportId,
      userId: params.userId,
      timestamp: new Date().toISOString(),
      purpose: params.purpose,
      dataTypes: params.dataTypes,
      dateRange: params.dateRange,
      data: {}
    }

    // Collect requested data
    for (const dataType of params.dataTypes) {
      switch (dataType) {
        case 'readings':
          const readings = await this.db.getBloodPressureReadings(params.userId, {
            startDate: params.dateRange.start,
            endDate: params.dateRange.end
          })
          exportData.data.readings = params.anonymize 
            ? readings.data?.map(r => this.anonymizeData(r, ['user_id', 'notes'])) 
            : readings.data
          break

        case 'symptoms':
          const symptoms = await this.db.getSymptomEntries(params.userId, {
            startDate: params.dateRange.start,
            endDate: params.dateRange.end
          })
          exportData.data.symptoms = params.anonymize 
            ? symptoms.data?.map(s => this.anonymizeData(s, ['user_id', 'notes'])) 
            : symptoms.data
          break

        case 'medications':
          const medications = await this.db.getMedicationEntries(params.userId, {
            startDate: params.dateRange.start,
            endDate: params.dateRange.end
          })
          exportData.data.medications = params.anonymize 
            ? medications.data?.map(m => this.anonymizeData(m, ['user_id', 'prescribed_by', 'side_effects'])) 
            : medications.data
          break
      }
    }

    // Add compliance metadata
    const compliance = {
      exportId,
      hipaaCompliant: true,
      anonymized: params.anonymize || false,
      purpose: params.purpose,
      exportedAt: new Date().toISOString(),
      exportedBy: params.userId,
      dataTypes: params.dataTypes,
      recordCount: Object.values(exportData.data).reduce((total: number, arr: any) => 
        total + (Array.isArray(arr) ? arr.length : 0), 0),
      retentionPolicy: 'Data should be deleted after use or within 90 days',
      disclaimer: 'This data is protected under HIPAA. Unauthorized access, use, or disclosure is prohibited.',
      contactInfo: 'For questions about this data export, contact: privacy@pregnancybptracker.com'
    }

    return {
      data: exportData,
      exportId,
      compliance
    }
  }

  // ==================== CONSENT MANAGEMENT ====================

  async recordConsent(params: {
    userId: string
    consentType: 'data_collection' | 'data_sharing' | 'marketing' | 'research'
    granted: boolean
    ipAddress?: string
    userAgent?: string
    additionalTerms?: string[]
  }): Promise<void> {
    try {
      const consentRecord = {
        user_id: params.userId,
        consent_type: params.consentType,
        consent_given: params.granted,
        consent_date: new Date().toISOString(),
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        additional_terms: params.additionalTerms || []
      }

      // Store in audit logs
      await this.db.insertAuditLog({
        user_id: params.userId,
        table_name: 'consent_record',
        action: 'INSERT',
        new_values: consentRecord,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        timestamp: new Date().toISOString()
      })

      // Update user profile
      if (params.consentType === 'data_collection') {
        await this.db.updateUserProfile(params.userId, {
          consent_given: params.granted,
          consent_date: new Date().toISOString()
        })
      } else if (params.consentType === 'data_sharing') {
        await this.db.updateUserProfile(params.userId, {
          data_sharing_consent: params.granted
        })
      }

      console.log('Consent recorded:', consentRecord)
    } catch (error) {
      console.error('Failed to record consent:', error)
      throw new Error('Failed to record consent')
    }
  }

  // ==================== DATA RETENTION ====================

  async getDataRetentionStatus(userId: string): Promise<{
    accountAge: number
    dataCount: {
      readings: number
      symptoms: number
      medications: number
    }
    retentionPolicy: string
    nextReviewDate: string
  }> {
    try {
      // Get user profile to determine account age
      const profile = await this.db.getUserProfile(userId)
      const accountCreated = profile.data?.created_at || new Date().toISOString()
      const accountAge = Math.floor((Date.now() - new Date(accountCreated).getTime()) / (1000 * 60 * 60 * 24))

      // Get data counts
      const readings = await this.db.getBloodPressureReadings(userId)
      const symptoms = await this.db.getSymptomEntries(userId)
      const medications = await this.db.getMedicationEntries(userId)

      return {
        accountAge,
        dataCount: {
          readings: readings.data?.length || 0,
          symptoms: symptoms.data?.length || 0,
          medications: medications.data?.length || 0
        },
        retentionPolicy: 'Health data is retained for 7 years from last access or as required by law',
        nextReviewDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // 1 year from now
      }
    } catch (error) {
      console.error('Failed to get retention status:', error)
      throw new Error('Failed to retrieve data retention status')
    }
  }

  // ==================== SECURITY UTILITIES ====================

  async validateSecureContext(): Promise<{
    isSecure: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    // Check if running over HTTPS in production
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
        issues.push('Connection is not encrypted (HTTPS required for HIPAA compliance)')
      }

      // Check for session storage security
      try {
        localStorage.setItem('hipaa_test', 'test')
        localStorage.removeItem('hipaa_test')
      } catch (error) {
        issues.push('Local storage is not available or secure')
      }
    }

    // Validate environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET'
    ]

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        issues.push(`Missing required environment variable: ${envVar}`)
      }
    })

    return {
      isSecure: issues.length === 0,
      issues
    }
  }

  // ==================== AUDIT TRAIL RETRIEVAL ====================

  async getUserAuditTrail(params: {
    userId: string
    startDate?: string
    endDate?: string
    actions?: string[]
    limit?: number
  }): Promise<AuditLog[]> {
    try {
      const response = await this.db.getAuditLogs(params)
      
      if (response.error) {
        throw new Error(response.error.message)
      }

      return response.data || []
    } catch (error) {
      console.error('Failed to retrieve audit trail:', error)
      throw new Error('Failed to retrieve audit trail')
    }
  }
}

// Export singleton instance
export const hipaaCompliance = HIPAACompliance.getInstance()

// Utility hooks for React components
export function useHIPAACompliance() {
  return hipaaCompliance
}

// Middleware helper for API routes
export function withHIPAALogging(handler: any) {
  return async (req: any, res: any) => {
    const startTime = Date.now()
    const hipaa = HIPAACompliance.getInstance()

    try {
      // Execute the actual handler
      const result = await handler(req, res)

      // Log successful access
      const userId = req.user?.id || req.headers['x-user-id']
      if (userId) {
        await hipaa.logDataAccess({
          userId,
          action: req.method as any,
          resource: req.url,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          result: 'success'
        })
      }

      return result
    } catch (error) {
      // Log failed access
      const userId = req.user?.id || req.headers['x-user-id']
      if (userId) {
        await hipaa.logDataAccess({
          userId,
          action: req.method as any,
          resource: req.url,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          result: 'failure',
          reason: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      throw error
    }
  }
}