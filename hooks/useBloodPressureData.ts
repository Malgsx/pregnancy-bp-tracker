"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getDatabase } from '@/lib/database'
import { getOfflineStorage } from '@/lib/offline-storage'
import {
  BloodPressureReading,
  BloodPressureReadingInsert,
  BloodPressureReadingUpdate,
  BloodPressureReadingWithRelations,
  BloodPressureStats,
  TrendData,
  RealtimePayload
} from '@/lib/database.types'

const db = getDatabase()

// Query keys for cache management
export const bloodPressureKeys = {
  all: ['bloodPressure'] as const,
  lists: () => [...bloodPressureKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bloodPressureKeys.lists(), { filters }] as const,
  details: () => [...bloodPressureKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloodPressureKeys.details(), id] as const,
  stats: (userId: string, startDate: string, endDate: string) => 
    [...bloodPressureKeys.all, 'stats', { userId, startDate, endDate }] as const,
  trends: (userId: string, days: number) => 
    [...bloodPressureKeys.all, 'trends', { userId, days }] as const,
}

// Hook for fetching blood pressure readings
export function useBloodPressureReadings(options: {
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
  enabled?: boolean
} = {}) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: bloodPressureKeys.list(options),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const response = await db.getBloodPressureReadings(userId, options)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data || []
    },
    enabled: !!userId && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes for health data
  })
}

// Hook for fetching a single reading with relations
export function useBloodPressureReading(readingId: string | undefined) {
  return useQuery({
    queryKey: bloodPressureKeys.detail(readingId || ''),
    queryFn: async () => {
      if (!readingId) throw new Error('Reading ID is required')
      
      const response = await db.getBloodPressureReadingWithRelations(readingId)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    enabled: !!readingId,
  })
}

// Hook for blood pressure statistics
export function useBloodPressureStats(startDate: string, endDate: string) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: bloodPressureKeys.stats(userId || '', startDate, endDate),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const response = await db.getBloodPressureStats(userId, startDate, endDate)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  })
}

// Hook for trend data
export function useBloodPressureTrends(days: number = 30) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: bloodPressureKeys.trends(userId || '', days),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const response = await db.getTrendData(userId, days)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data || []
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes for trends
  })
}

// Hook for creating blood pressure readings with offline support
export function useCreateBloodPressureReading() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id
  const offlineStorage = userId ? getOfflineStorage(userId) : null

  return useMutation({
    mutationFn: async (reading: BloodPressureReadingInsert) => {
      if (!userId) throw new Error('User not authenticated')

      // Try online first, fallback to offline
      if (offlineStorage?.isOnline()) {
        const response = await db.createBloodPressureReading({ ...reading, user_id: userId })
        if (response.error) {
          throw new Error(response.error.message)
        }
        return response.data
      } else {
        // Store offline
        const response = await offlineStorage?.createBloodPressureReadingOffline({ ...reading, user_id: userId })
        if (response?.error) {
          throw new Error(response.error.message)
        }
        return response?.data
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch blood pressure queries
      queryClient.invalidateQueries({ queryKey: bloodPressureKeys.all })
      
      toast.success(
        offlineStorage?.isOnline() 
          ? 'Blood pressure reading recorded successfully' 
          : 'Reading saved offline. Will sync when connected.'
      )
    },
    onError: (error) => {
      console.error('Failed to create blood pressure reading:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to record reading')
    },
  })
}

// Hook for updating blood pressure readings
export function useUpdateBloodPressureReading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BloodPressureReadingUpdate }) => {
      const response = await db.updateBloodPressureReading(id, updates)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    onSuccess: (data) => {
      // Update specific reading in cache
      queryClient.setQueryData(bloodPressureKeys.detail(data!.id), data)
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bloodPressureKeys.lists() })
      
      toast.success('Blood pressure reading updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update blood pressure reading:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update reading')
    },
  })
}

// Hook for deleting blood pressure readings
export function useDeleteBloodPressureReading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await db.deleteBloodPressureReading(id)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate all blood pressure queries
      queryClient.invalidateQueries({ queryKey: bloodPressureKeys.all })
      
      toast.success('Blood pressure reading deleted successfully')
    },
    onError: (error) => {
      console.error('Failed to delete blood pressure reading:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete reading')
    },
  })
}

// Hook for real-time subscriptions
export function useBloodPressureSubscription() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!userId) return

    const unsubscribe = db.subscribeToUserData(
      userId,
      (payload: RealtimePayload<any>) => {
        if (payload.table === 'blood_pressure_readings') {
          // Invalidate queries to fetch fresh data
          queryClient.invalidateQueries({ queryKey: bloodPressureKeys.all })

          // Show notification for real-time updates
          if (payload.eventType === 'INSERT' && payload.new) {
            toast.info('New blood pressure reading synced')
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            toast.info('Blood pressure reading updated')
          }
        }
      }
    )

    setIsSubscribed(true)

    return () => {
      unsubscribe()
      setIsSubscribed(false)
    }
  }, [userId, queryClient])

  return { isSubscribed }
}

// Hook for offline sync status
export function useOfflineSyncStatus() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const offlineStorage = userId ? getOfflineStorage(userId) : null
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!offlineStorage) return

    const updateStatus = () => {
      setPendingCount(offlineStorage.getPendingSyncCount())
      setLastSync(offlineStorage.getLastSyncTime())
      setIsOnline(offlineStorage.isOnline())
    }

    // Initial update
    updateStatus()

    // Listen for network status changes
    const unsubscribeNetwork = offlineStorage.onNetworkStatusChange(updateStatus)

    // Update status periodically
    const interval = setInterval(updateStatus, 30000) // Every 30 seconds

    return () => {
      unsubscribeNetwork()
      clearInterval(interval)
    }
  }, [offlineStorage])

  const syncNow = async () => {
    if (!offlineStorage) return
    
    toast.loading('Syncing offline data...')
    
    try {
      const result = await offlineStorage.syncOfflineData()
      
      if (result.success) {
        toast.success(`Synced ${result.synced.length} records successfully`)
      } else {
        toast.error(`Sync completed with ${result.errors.length} errors`)
      }
      
      if (result.conflicts.length > 0) {
        toast.warning(`${result.conflicts.length} conflicts require resolution`)
      }
      
      return result
    } catch (error) {
      toast.error('Sync failed')
      throw error
    }
  }

  return {
    pendingCount,
    lastSync,
    isOnline,
    syncNow,
  }
}

// Combined hook for all blood pressure functionality
export function useBloodPressureManager(options: {
  autoSync?: boolean
  realtimeUpdates?: boolean
} = {}) {
  const { autoSync = true, realtimeUpdates = true } = options

  // Enable real-time subscriptions if requested
  const { isSubscribed } = realtimeUpdates ? useBloodPressureSubscription() : { isSubscribed: false }
  
  // Monitor offline sync status
  const { pendingCount, lastSync, isOnline, syncNow } = useOfflineSyncStatus()

  // Auto-sync when coming online
  useEffect(() => {
    if (autoSync && isOnline && pendingCount > 0) {
      const timer = setTimeout(() => {
        syncNow().catch(console.error)
      }, 1000) // Wait 1 second after coming online

      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount, autoSync, syncNow])

  return {
    // Subscription status
    isSubscribed,
    
    // Offline sync status
    pendingCount,
    lastSync,
    isOnline,
    syncNow,
    
    // Query hooks
    useReadings: useBloodPressureReadings,
    useReading: useBloodPressureReading,
    useStats: useBloodPressureStats,
    useTrends: useBloodPressureTrends,
    
    // Mutation hooks
    useCreate: useCreateBloodPressureReading,
    useUpdate: useUpdateBloodPressureReading,
    useDelete: useDeleteBloodPressureReading,
  }
}