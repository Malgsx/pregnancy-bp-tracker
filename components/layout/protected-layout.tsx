"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserNav } from "@/components/auth/user-nav"
import Link from "next/link"
import { Heart, BarChart3, User, Settings, Download } from "lucide-react"

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ProtectedLayout({ children, title }: ProtectedLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-pink-500" />
                <h1 className="text-xl font-bold text-gray-900">BP Tracker</h1>
              </Link>
              {title && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-600">{title}</span>
                </>
              )}
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/readings"
                  className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span>Readings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/export"
                  className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Export Data</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}