"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, ReactNode } from 'react'

interface ReactQueryProviderProps {
  children: ReactNode
}

export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time for health data should be shorter
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Enable background refetch for real-time updates
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on authentication errors
              if (error?.status === 401 || error?.status === 403) {
                return false
              }
              // Don't retry on validation errors
              if (error?.code === 'VALIDATION_ERROR') {
                return false
              }
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations for network errors
            retry: (failureCount, error: any) => {
              if (error?.status === 401 || error?.status === 403) {
                return false
              }
              if (error?.code === 'VALIDATION_ERROR') {
                return false
              }
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}