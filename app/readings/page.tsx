"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { Plus, Heart, TrendingUp, Download, Search, Filter, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BloodPressureReading {
  id: string
  systolic: number
  diastolic: number
  heart_rate: number | null
  reading_time: string
  notes: string | null
  position: string | null
  stress_level: number | null
  weight_kg: number | null
  medication_taken: boolean
  felt_symptoms: boolean
}

export default function ReadingsPage() {
  const { data: session } = useSession()
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [filteredReadings, setFilteredReadings] = useState<BloodPressureReading[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchReadings()
    }
  }, [session])

  useEffect(() => {
    // Filter readings based on search term
    const filtered = readings.filter(reading => 
      reading.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(reading.reading_time), "PPP").toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredReadings(filtered)
  }, [readings, searchTerm])

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from("blood_pressure_readings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .eq("is_deleted", false)
        .order("reading_time", { ascending: false })

      if (error) {
        console.error("Error fetching readings:", error)
        return
      }

      setReadings(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 110) return { category: "Crisis", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
    if (systolic >= 140 || diastolic >= 90) return { category: "High", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" }
    if (systolic >= 130 || diastolic >= 80) return { category: "Elevated", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" }
    if (systolic >= 120 || diastolic >= 80) return { category: "Normal", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" }
    return { category: "Low", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" }
  }

  const prepareChartData = () => {
    return readings
      .slice(-30) // Last 30 readings
      .reverse()
      .map((reading, index) => ({
        date: format(new Date(reading.reading_time), "MMM d"),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heart_rate: reading.heart_rate,
        fullDate: format(new Date(reading.reading_time), "PPp"),
        index: index
      }))
  }

  const exportToCSV = () => {
    if (readings.length === 0) return

    const headers = [
      "Date & Time",
      "Systolic",
      "Diastolic", 
      "Heart Rate",
      "Position",
      "Weight (kg)",
      "Stress Level",
      "Medication Taken",
      "Felt Symptoms",
      "Notes"
    ]

    const csvContent = [
      headers.join(","),
      ...readings.map(reading => [
        `"${format(new Date(reading.reading_time), "yyyy-MM-dd HH:mm:ss")}"`,
        reading.systolic,
        reading.diastolic,
        reading.heart_rate || "",
        `"${reading.position || ""}"`,
        reading.weight_kg || "",
        reading.stress_level || "",
        reading.medication_taken ? "Yes" : "No",
        reading.felt_symptoms ? "Yes" : "No",
        `"${reading.notes || ""}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `blood-pressure-readings-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const chartData = prepareChartData()

  return (
    <ProtectedLayout title="Blood Pressure Readings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blood Pressure Readings</h1>
            <p className="text-gray-600">{readings.length} total readings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Link href="/readings/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Reading
              </Button>
            </Link>
          </div>
        </div>

        {/* Charts */}
        {readings.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure Trends</CardTitle>
              <CardDescription>Your last 30 readings visualized over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={['dataMin - 10', 'dataMax + 10']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(value, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.fullDate
                        }
                        return value
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}${name === 'heart_rate' ? ' bpm' : ' mmHg'}`, 
                        name === 'systolic' ? 'Systolic' : 
                        name === 'diastolic' ? 'Diastolic' : 'Heart Rate'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Systolic"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Diastolic"
                      connectNulls={false}
                    />
                    {chartData.some(d => d.heart_rate) && (
                      <Line 
                        type="monotone" 
                        dataKey="heart_rate" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Heart Rate"
                        connectNulls={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Readings</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search readings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your readings...</p>
              </div>
            ) : filteredReadings.length > 0 ? (
              <div className="space-y-4">
                {filteredReadings.map((reading) => {
                  const category = getBloodPressureCategory(reading.systolic, reading.diastolic)
                  return (
                    <div 
                      key={reading.id} 
                      className={`p-4 rounded-lg border ${category.borderColor} ${category.bgColor} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              <Heart className="h-5 w-5 text-red-500" />
                              <span className="text-2xl font-bold">{reading.systolic}/{reading.diastolic}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${category.color} bg-white border`}>
                                {category.category}
                              </span>
                            </div>
                            {reading.heart_rate && (
                              <div className="text-sm text-gray-600">
                                ❤️ {reading.heart_rate} bpm
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            📅 {format(new Date(reading.reading_time), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {reading.position && (
                              <span>📍 {reading.position}</span>
                            )}
                            {reading.weight_kg && (
                              <span>⚖️ {reading.weight_kg} kg</span>
                            )}
                            {reading.stress_level && (
                              <span>😰 Stress: {reading.stress_level}/10</span>
                            )}
                            {reading.medication_taken && (
                              <span>💊 Medication taken</span>
                            )}
                            {reading.felt_symptoms && (
                              <span>⚠️ Felt symptoms</span>
                            )}
                          </div>

                          {reading.notes && (
                            <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-200">
                              <p className="text-sm text-gray-700">📝 {reading.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : readings.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No readings yet</h3>
                <p className="text-gray-500 mb-6">Start tracking your blood pressure to see trends and insights.</p>
                <Link href="/readings/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Reading
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No readings match your search criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}