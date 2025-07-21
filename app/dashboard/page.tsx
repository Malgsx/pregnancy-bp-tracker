"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Plus, Heart, TrendingUp, Calendar, AlertTriangle, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { format } from "date-fns"

interface BloodPressureReading {
  id: string
  systolic: number
  diastolic: number
  heart_rate: number | null
  reading_time: string
  notes: string | null
  position: string | null
  stress_level: number | null
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    latest: null as BloodPressureReading | null,
    weeklyAverage: { systolic: 0, diastolic: 0 },
    weeklyCount: 0,
    totalCount: 0
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchReadings()
    }
  }, [session])

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from("blood_pressure_readings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .eq("is_deleted", false)
        .order("reading_time", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching readings:", error)
        return
      }

      setReadings(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (allReadings: BloodPressureReading[]) => {
    const latest = allReadings[0] || null
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyReadings = allReadings.filter(reading => 
      new Date(reading.reading_time) >= weekAgo
    )

    let weeklyAverage = { systolic: 0, diastolic: 0 }
    if (weeklyReadings.length > 0) {
      const totalSystolic = weeklyReadings.reduce((sum, r) => sum + r.systolic, 0)
      const totalDiastolic = weeklyReadings.reduce((sum, r) => sum + r.diastolic, 0)
      weeklyAverage = {
        systolic: Math.round(totalSystolic / weeklyReadings.length),
        diastolic: Math.round(totalDiastolic / weeklyReadings.length)
      }
    }

    setStats({
      latest,
      weeklyAverage,
      weeklyCount: weeklyReadings.length,
      totalCount: allReadings.length
    })
  }

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 110) return { category: "Crisis", color: "text-red-600", bgColor: "bg-red-50" }
    if (systolic >= 140 || diastolic >= 90) return { category: "High", color: "text-red-500", bgColor: "bg-red-50" }
    if (systolic >= 130 || diastolic >= 80) return { category: "Elevated", color: "text-yellow-600", bgColor: "bg-yellow-50" }
    if (systolic >= 120 || diastolic >= 80) return { category: "Normal", color: "text-green-600", bgColor: "bg-green-50" }
    return { category: "Low", color: "text-blue-600", bgColor: "bg-blue-50" }
  }

  return (
    <ProtectedLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-pink-100">
            Keep track of your blood pressure during this important journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/readings/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Reading</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Log your latest blood pressure reading</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Latest Reading</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.latest ? (
                <div>
                  <p className="text-2xl font-bold">{stats.latest.systolic}/{stats.latest.diastolic}</p>
                  <p className="text-sm text-gray-600">{format(new Date(stats.latest.reading_time), "MMM d, h:mm a")}</p>
                  {stats.latest.heart_rate && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      {stats.latest.heart_rate} bpm
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold">--/--</p>
                  <p className="text-sm text-gray-600">No readings yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>7-Day Average</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.weeklyCount > 0 ? (
                <div>
                  <p className="text-2xl font-bold">{stats.weeklyAverage.systolic}/{stats.weeklyAverage.diastolic}</p>
                  <p className="text-sm text-gray-600">Based on {stats.weeklyCount} readings</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold">--/--</p>
                  <p className="text-sm text-gray-600">Not enough data</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.weeklyCount}</p>
              <p className="text-sm text-gray-600">readings recorded</p>
              {stats.totalCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{stats.totalCount} total</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Health Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>Your latest blood pressure measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading readings...</p>
                </div>
              ) : readings.length > 0 ? (
                <div className="space-y-3">
                  {readings.slice(0, 5).map((reading) => {
                    const category = getBloodPressureCategory(reading.systolic, reading.diastolic)
                    return (
                      <div key={reading.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{reading.systolic}/{reading.diastolic}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${category.bgColor} ${category.color}`}>
                              {category.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(reading.reading_time), "MMM d, h:mm a")}
                            {reading.heart_rate && ` • ${reading.heart_rate} bpm`}
                          </p>
                        </div>
                        {reading.notes && (
                          <p className="text-xs text-gray-500 max-w-xs truncate">{reading.notes}</p>
                        )}
                      </div>
                    )
                  })}
                  {readings.length > 5 && (
                    <Link href="/readings">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Readings
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No readings recorded yet</p>
                  <Link href="/readings/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Reading
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Health Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.latest && (
                <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800">
                    Your Latest Reading: {getBloodPressureCategory(stats.latest.systolic, stats.latest.diastolic).category}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {stats.latest.systolic >= 140 || stats.latest.diastolic >= 90 
                      ? "Consider contacting your healthcare provider about this elevated reading."
                      : "Keep up the good work! Continue monitoring regularly."}
                  </p>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Monitor regularly</p>
                  <p className="text-sm text-gray-600">
                    Track your blood pressure at least twice daily during pregnancy.
                    {stats.weeklyCount < 7 && " Try to record more readings this week."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Stay consistent</p>
                  <p className="text-sm text-gray-600">
                    Take readings at the same time each day for the most accurate trends.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Share with your doctor</p>
                  <p className="text-sm text-gray-600">
                    Export your readings to share with your healthcare provider at your next visit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Prompt */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Complete Your Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Complete your profile information to get personalized insights and enable healthcare provider features.
            </p>
            <Link href="/profile">
              <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}