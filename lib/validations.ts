import { z } from 'zod'

// Base validation constants
export const VALIDATION_LIMITS = {
  SYSTOLIC: { min: 70, max: 250 },
  DIASTOLIC: { min: 40, max: 150 },
  HEART_RATE: { min: 40, max: 200 },
  STRESS_LEVEL: { min: 1, max: 10 },
  SLEEP_HOURS: { min: 0, max: 24 },
  WEIGHT_KG: { min: 30, max: 300 },
  SEVERITY: { min: 1, max: 10 },
  DURATION_MINUTES: { min: 1, max: 1440 }, // 24 hours
  EFFECTIVENESS_RATING: { min: 1, max: 5 }
} as const

// Enum validation schemas
export const positionSchema = z.enum(['sitting', 'lying', 'standing'])
export const armUsedSchema = z.enum(['left', 'right'])
export const medicationRouteSchema = z.enum(['oral', 'injection', 'topical', 'other'])
export const syncStatusSchema = z.enum(['pending', 'synced', 'conflict'])
export const symptomCategorySchema = z.enum(['physical', 'emotional', 'pregnancy-specific', 'cardiovascular'])
export const medicationCategorySchema = z.enum(['antihypertensive', 'prenatal', 'supplement', 'other'])
export const pregnancyCategorySchema = z.enum(['A', 'B', 'C', 'D', 'X'])

// User Profile validation
export const userProfileInsertSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  phone_number: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long')
    .optional(),
  date_of_birth: z.string().date('Invalid date format').optional(),
  emergency_contact_name: z.string().max(100, 'Name too long').optional(),
  emergency_contact_phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  emergency_contact_relationship: z.string().max(50, 'Relationship description too long').optional(),
  healthcare_provider_name: z.string().max(200, 'Provider name too long').optional(),
  healthcare_provider_phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  healthcare_provider_address: z.string().max(500, 'Address too long').optional(),
  due_date: z.string().date('Invalid due date format').optional(),
  pregnancy_start_date: z.string().date('Invalid pregnancy start date').optional(),
  bp_target_systolic: z.number()
    .int('Systolic must be a whole number')
    .min(VALIDATION_LIMITS.SYSTOLIC.min, `Systolic must be at least ${VALIDATION_LIMITS.SYSTOLIC.min}`)
    .max(VALIDATION_LIMITS.SYSTOLIC.max, `Systolic cannot exceed ${VALIDATION_LIMITS.SYSTOLIC.max}`)
    .optional(),
  bp_target_diastolic: z.number()
    .int('Diastolic must be a whole number')
    .min(VALIDATION_LIMITS.DIASTOLIC.min, `Diastolic must be at least ${VALIDATION_LIMITS.DIASTOLIC.min}`)
    .max(VALIDATION_LIMITS.DIASTOLIC.max, `Diastolic cannot exceed ${VALIDATION_LIMITS.DIASTOLIC.max}`)
    .optional(),
  medical_history: z.record(z.string(), z.any()).optional(),
  risk_factors: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  measurement_unit: z.enum(['mmHg', 'kPa']).optional(),
  notification_preferences: z.record(z.string(), z.any()).optional(),
  consent_given: z.boolean().optional(),
  consent_date: z.string().datetime('Invalid consent date').optional(),
  data_sharing_consent: z.boolean().optional()
}).refine(data => {
  // Custom validation: if due date is provided, pregnancy start date should also be provided
  if (data.due_date && !data.pregnancy_start_date) {
    return false
  }
  return true
}, {
  message: 'Pregnancy start date is required when due date is provided',
  path: ['pregnancy_start_date']
}).refine(data => {
  // Custom validation: BP targets should be realistic
  if (data.bp_target_systolic && data.bp_target_diastolic) {
    return data.bp_target_systolic > data.bp_target_diastolic
  }
  return true
}, {
  message: 'Systolic pressure should be higher than diastolic pressure',
  path: ['bp_target_systolic']
})

export const userProfileUpdateSchema = userProfileInsertSchema.partial()

// Blood Pressure Reading validation
export const bloodPressureReadingInsertSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  systolic: z.number()
    .int('Systolic must be a whole number')
    .min(VALIDATION_LIMITS.SYSTOLIC.min, `Systolic must be at least ${VALIDATION_LIMITS.SYSTOLIC.min}`)
    .max(VALIDATION_LIMITS.SYSTOLIC.max, `Systolic cannot exceed ${VALIDATION_LIMITS.SYSTOLIC.max}`),
  diastolic: z.number()
    .int('Diastolic must be a whole number')
    .min(VALIDATION_LIMITS.DIASTOLIC.min, `Diastolic must be at least ${VALIDATION_LIMITS.DIASTOLIC.min}`)
    .max(VALIDATION_LIMITS.DIASTOLIC.max, `Diastolic cannot exceed ${VALIDATION_LIMITS.DIASTOLIC.max}`),
  heart_rate: z.number()
    .int('Heart rate must be a whole number')
    .min(VALIDATION_LIMITS.HEART_RATE.min, `Heart rate must be at least ${VALIDATION_LIMITS.HEART_RATE.min}`)
    .max(VALIDATION_LIMITS.HEART_RATE.max, `Heart rate cannot exceed ${VALIDATION_LIMITS.HEART_RATE.max}`)
    .optional(),
  reading_time: z.string().datetime('Invalid reading time'),
  position: positionSchema.optional(),
  arm_used: armUsedSchema.optional(),
  device_used: z.string().max(100, 'Device name too long').optional(),
  weight_kg: z.number()
    .min(VALIDATION_LIMITS.WEIGHT_KG.min, `Weight must be at least ${VALIDATION_LIMITS.WEIGHT_KG.min}kg`)
    .max(VALIDATION_LIMITS.WEIGHT_KG.max, `Weight cannot exceed ${VALIDATION_LIMITS.WEIGHT_KG.max}kg`)
    .optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  activity_before_reading: z.string().max(200, 'Activity description too long').optional(),
  stress_level: z.number()
    .int('Stress level must be a whole number')
    .min(VALIDATION_LIMITS.STRESS_LEVEL.min, `Stress level must be at least ${VALIDATION_LIMITS.STRESS_LEVEL.min}`)
    .max(VALIDATION_LIMITS.STRESS_LEVEL.max, `Stress level cannot exceed ${VALIDATION_LIMITS.STRESS_LEVEL.max}`)
    .optional(),
  sleep_hours: z.number()
    .min(VALIDATION_LIMITS.SLEEP_HOURS.min, `Sleep hours must be at least ${VALIDATION_LIMITS.SLEEP_HOURS.min}`)
    .max(VALIDATION_LIMITS.SLEEP_HOURS.max, `Sleep hours cannot exceed ${VALIDATION_LIMITS.SLEEP_HOURS.max}`)
    .optional(),
  medication_taken: z.boolean().optional(),
  felt_symptoms: z.boolean().optional(),
  is_manual_entry: z.boolean().optional(),
  sync_status: syncStatusSchema.optional(),
  local_id: z.string().optional(),
  created_by: z.string().optional()
}).refine(data => {
  // Custom validation: systolic should be higher than diastolic
  return data.systolic > data.diastolic
}, {
  message: 'Systolic pressure must be higher than diastolic pressure',
  path: ['systolic']
}).refine(data => {
  // Custom validation: reading time should not be in the future
  const readingTime = new Date(data.reading_time)
  const now = new Date()
  return readingTime <= now
}, {
  message: 'Reading time cannot be in the future',
  path: ['reading_time']
})

export const bloodPressureReadingUpdateSchema = bloodPressureReadingInsertSchema
  .omit({ user_id: true })
  .partial()

// Symptom Entry validation
export const symptomEntryInsertSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  reading_id: z.string().uuid('Invalid reading ID').optional(),
  symptom_id: z.string().uuid('Invalid symptom ID').optional(),
  custom_symptom_name: z.string().max(100, 'Symptom name too long').optional(),
  severity: z.number()
    .int('Severity must be a whole number')
    .min(VALIDATION_LIMITS.SEVERITY.min, `Severity must be at least ${VALIDATION_LIMITS.SEVERITY.min}`)
    .max(VALIDATION_LIMITS.SEVERITY.max, `Severity cannot exceed ${VALIDATION_LIMITS.SEVERITY.max}`)
    .optional(),
  duration_minutes: z.number()
    .int('Duration must be a whole number')
    .min(VALIDATION_LIMITS.DURATION_MINUTES.min, 'Duration must be at least 1 minute')
    .max(VALIDATION_LIMITS.DURATION_MINUTES.max, 'Duration cannot exceed 24 hours')
    .optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  occurred_at: z.string().datetime('Invalid occurrence time').optional(),
  sync_status: syncStatusSchema.optional(),
  local_id: z.string().optional()
}).refine(data => {
  // Custom validation: either symptom_id OR custom_symptom_name must be provided
  return data.symptom_id || data.custom_symptom_name
}, {
  message: 'Either select a symptom or provide a custom symptom name',
  path: ['symptom_id']
}).refine(data => {
  // Custom validation: occurrence time should not be in the future
  if (data.occurred_at) {
    const occurrenceTime = new Date(data.occurred_at)
    const now = new Date()
    return occurrenceTime <= now
  }
  return true
}, {
  message: 'Occurrence time cannot be in the future',
  path: ['occurred_at']
})

export const symptomEntryUpdateSchema = symptomEntryInsertSchema
  .omit({ user_id: true })
  .partial()

// Medication Entry validation
export const medicationEntryInsertSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  reading_id: z.string().uuid('Invalid reading ID').optional(),
  medication_id: z.string().uuid('Invalid medication ID').optional(),
  custom_medication_name: z.string().max(100, 'Medication name too long').optional(),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage description too long'),
  dosage_unit: z.string().max(20, 'Dosage unit too long').optional(),
  frequency: z.string().max(100, 'Frequency description too long').optional(),
  route: medicationRouteSchema.optional(),
  taken_at: z.string().datetime('Invalid taken time').optional(),
  prescribed_by: z.string().max(200, 'Prescriber name too long').optional(),
  taken_with_food: z.boolean().optional(),
  missed_dose: z.boolean().optional(),
  side_effects: z.string().max(500, 'Side effects description too long').optional(),
  effectiveness_rating: z.number()
    .int('Effectiveness rating must be a whole number')
    .min(VALIDATION_LIMITS.EFFECTIVENESS_RATING.min, `Rating must be at least ${VALIDATION_LIMITS.EFFECTIVENESS_RATING.min}`)
    .max(VALIDATION_LIMITS.EFFECTIVENESS_RATING.max, `Rating cannot exceed ${VALIDATION_LIMITS.EFFECTIVENESS_RATING.max}`)
    .optional(),
  sync_status: syncStatusSchema.optional(),
  local_id: z.string().optional()
}).refine(data => {
  // Custom validation: either medication_id OR custom_medication_name must be provided
  return data.medication_id || data.custom_medication_name
}, {
  message: 'Either select a medication or provide a custom medication name',
  path: ['medication_id']
}).refine(data => {
  // Custom validation: taken time should not be in the future
  if (data.taken_at) {
    const takenTime = new Date(data.taken_at)
    const now = new Date()
    return takenTime <= now
  }
  return true
}, {
  message: 'Taken time cannot be in the future',
  path: ['taken_at']
})

export const medicationEntryUpdateSchema = medicationEntryInsertSchema
  .omit({ user_id: true })
  .partial()

// Reference data validation (for symptoms and medications tables)
export const symptomInsertSchema = z.object({
  name: z.string().min(1, 'Symptom name is required').max(100, 'Name too long'),
  category: symptomCategorySchema,
  description: z.string().max(500, 'Description too long').optional(),
  severity_scale: z.number().int().min(1).max(10).optional(),
  is_active: z.boolean().optional()
})

export const medicationInsertSchema = z.object({
  name: z.string().min(1, 'Medication name is required').max(100, 'Name too long'),
  generic_name: z.string().max(100, 'Generic name too long').optional(),
  category: medicationCategorySchema,
  dosage_forms: z.array(z.string()).optional(),
  pregnancy_category: pregnancyCategorySchema.optional(),
  common_dosages: z.array(z.string()).optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  warnings: z.string().max(1000, 'Warnings too long').optional(),
  is_active: z.boolean().optional()
})

// Bulk operations validation
export const bulkBloodPressureInsertSchema = z.object({
  readings: z.array(bloodPressureReadingInsertSchema).min(1, 'At least one reading is required').max(50, 'Cannot insert more than 50 readings at once')
})

export const bulkSymptomEntryInsertSchema = z.object({
  entries: z.array(symptomEntryInsertSchema).min(1, 'At least one entry is required').max(100, 'Cannot insert more than 100 entries at once')
})

export const bulkMedicationEntryInsertSchema = z.object({
  entries: z.array(medicationEntryInsertSchema).min(1, 'At least one entry is required').max(100, 'Cannot insert more than 100 entries at once')
})

// Query parameter validation
export const dateRangeQuerySchema = z.object({
  start_date: z.string().date('Invalid start date'),
  end_date: z.string().date('Invalid end date'),
  timezone: z.string().optional()
}).refine(data => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return startDate <= endDate
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date']
}).refine(data => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000 // 1 year
  return (endDate.getTime() - startDate.getTime()) <= maxRangeMs
}, {
  message: 'Date range cannot exceed 1 year',
  path: ['end_date']
})

export const paginationQuerySchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
})

// HIPAA compliance validation
export const consentSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  consent_type: z.enum(['data_collection', 'data_sharing', 'marketing', 'research']),
  consent_given: z.boolean(),
  consent_date: z.string().datetime('Invalid consent date'),
  ip_address: z.string().optional(),
  user_agent: z.string().optional()
})

// Offline sync validation
export const offlineRecordSchema = z.object({
  id: z.string().uuid('Invalid record ID'),
  table: z.string().min(1, 'Table name is required'),
  action: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  data: z.any(),
  timestamp: z.string().datetime('Invalid timestamp'),
  synced: z.boolean(),
  conflict: z.boolean().optional()
})

export const syncBatchSchema = z.object({
  records: z.array(offlineRecordSchema).max(100, 'Cannot sync more than 100 records at once'),
  device_id: z.string().optional(),
  last_sync_timestamp: z.string().datetime('Invalid last sync timestamp').optional()
})

// Export/import validation
export const exportRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']),
  date_range: dateRangeQuerySchema.optional(),
  include_symptoms: z.boolean().optional(),
  include_medications: z.boolean().optional(),
  anonymize: z.boolean().optional()
})

// Helper functions for validation
export function validateBloodPressureReading(data: unknown) {
  return bloodPressureReadingInsertSchema.safeParse(data)
}

export function validateSymptomEntry(data: unknown) {
  return symptomEntryInsertSchema.safeParse(data)
}

export function validateMedicationEntry(data: unknown) {
  return medicationEntryInsertSchema.safeParse(data)
}

export function validateUserProfile(data: unknown) {
  return userProfileInsertSchema.safeParse(data)
}

// Custom error formatter
export function formatValidationErrors(errors: z.ZodError) {
  return errors.issues.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }))
}

// Type guards
export function isValidBloodPressureReading(data: any): data is z.infer<typeof bloodPressureReadingInsertSchema> {
  return bloodPressureReadingInsertSchema.safeParse(data).success
}

export function isValidSymptomEntry(data: any): data is z.infer<typeof symptomEntryInsertSchema> {
  return symptomEntryInsertSchema.safeParse(data).success
}

export function isValidMedicationEntry(data: any): data is z.infer<typeof medicationEntryInsertSchema> {
  return medicationEntryInsertSchema.safeParse(data).success
}