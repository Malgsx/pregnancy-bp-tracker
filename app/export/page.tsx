"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Download, FileText, Calendar, Printer, Share2, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "sonner"

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

interface UserProfile {
  full_name: string | null
  email: string
  due_date: string | null
  healthcare_provider_name: string | null
  healthcare_provider_phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
}

export default function ExportPage() {
  const { data: session } = useSession()
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30") // days

  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session, dateRange])

  const fetchData = async () => {
    try {
      const daysAgo = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      
      // Fetch readings
      const { data: readingsData, error: readingsError } = await supabase
        .from("blood_pressure_readings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .eq("is_deleted", false)
        .gte("reading_time", daysAgo.toISOString())
        .order("reading_time", { ascending: false })

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("full_name, email, due_date, healthcare_provider_name, healthcare_provider_phone, emergency_contact_name, emergency_contact_phone")
        .eq("user_id", session?.user?.id)
        .single()

      if (readingsError) {
        console.error("Error fetching readings:", readingsError)
      } else {
        setReadings(readingsData || [])
      }

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (readings.length === 0) {
      toast.error("No readings to export")
      return
    }

    const headers = [
      "Date & Time",
      "Systolic (mmHg)",
      "Diastolic (mmHg)", 
      "Heart Rate (bpm)",
      "Position",
      "Weight (kg)",
      "Stress Level (1-10)",
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
    
    toast.success("Blood pressure readings exported successfully!")
  }

  const generateHealthcareReport = () => {
    if (readings.length === 0) {
      toast.error("No readings to include in report")
      return
    }

    const reportContent = generateReportContent()
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `healthcare-report-${format(new Date(), "yyyy-MM-dd")}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Healthcare report generated successfully!")
  }

  const generateReportContent = () => {
    const stats = calculateStats()
    
    return `
PREGNANCY BLOOD PRESSURE MONITORING REPORT
==========================================

Patient Information:
- Name: ${profile?.full_name || session?.user?.name || "N/A"}
- Email: ${profile?.email || session?.user?.email || "N/A"}
- Due Date: ${profile?.due_date ? format(new Date(profile.due_date), "MMMM d, yyyy") : "N/A"}
- Report Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}

Healthcare Provider:
- Name: ${profile?.healthcare_provider_name || "N/A"}
- Phone: ${profile?.healthcare_provider_phone || "N/A"}

Emergency Contact:
- Name: ${profile?.emergency_contact_name || "N/A"}
- Phone: ${profile?.emergency_contact_phone || "N/A"}

SUMMARY STATISTICS (Last ${dateRange} Days)
==========================================
- Total Readings: ${readings.length}
- Average Blood Pressure: ${stats.avgSystolic}/${stats.avgDiastolic} mmHg
- Highest Reading: ${stats.maxSystolic}/${stats.maxDiastolic} mmHg
- Lowest Reading: ${stats.minSystolic}/${stats.minDiastolic} mmHg
- Readings with High BP (≥140/90): ${stats.highReadings}
- Readings with Symptoms: ${stats.symptomsCount}
- Days with Medication: ${stats.medicationDays}

RECENT READINGS
===============
${readings.slice(0, 20).map(reading => `
${format(new Date(reading.reading_time), "yyyy-MM-dd HH:mm")} | ${reading.systolic}/${reading.diastolic} mmHg${reading.heart_rate ? ` | ${reading.heart_rate} bpm` : ""}${reading.position ? ` | ${reading.position}` : ""}${reading.medication_taken ? " | Medication taken" : ""}${reading.felt_symptoms ? " | Symptoms noted" : ""}${reading.notes ? ` | Notes: ${reading.notes}` : ""}
`).join("")}

RECOMMENDATIONS
===============
- Continue regular monitoring as advised by healthcare provider
- Share this report with your healthcare team
- Contact healthcare provider if readings consistently exceed 140/90 mmHg
- Monitor for symptoms of preeclampsia (headache, vision changes, swelling)

This report was generated by the Pregnancy BP Tracker application.
For questions or concerns, contact your healthcare provider immediately.
`
  }

  const calculateStats = () => {
    if (readings.length === 0) {
      return {
        avgSystolic: 0,
        avgDiastolic: 0,
        maxSystolic: 0,
        maxDiastolic: 0,
        minSystolic: 0,
        minDiastolic: 0,
        highReadings: 0,
        symptomsCount: 0,
        medicationDays: 0
      }
    }

    const systolicValues = readings.map(r => r.systolic)
    const diastolicValues = readings.map(r => r.diastolic)
    
    return {
      avgSystolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
      avgDiastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
      maxSystolic: Math.max(...systolicValues),
      maxDiastolic: Math.max(...diastolicValues),
      minSystolic: Math.min(...systolicValues),
      minDiastolic: Math.min(...diastolicValues),
      highReadings: readings.filter(r => r.systolic >= 140 || r.diastolic >= 90).length,
      symptomsCount: readings.filter(r => r.felt_symptoms).length,
      medicationDays: readings.filter(r => r.medication_taken).length
    }
  }

  const printReport = () => {
    const reportContent = generateReportContent()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Blood Pressure Report</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${reportContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const stats = calculateStats()

  return (
    <ProtectedLayout title="Export Data">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export & Share Data</h1>
          <p className="text-gray-600">Share your blood pressure data with healthcare providers</p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Data Range</CardTitle>
            <CardDescription>Choose the time period for your export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {["7", "30", "60", "90"].map((days) => (
                <Button
                  key={days}
                  variant={dateRange === days ? "default" : "outline"}
                  onClick={() => setDateRange(days)}
                >
                  Last {days} days
                </Button>
              ))}
              <Button
                variant={dateRange === "all" ? "default" : "outline"}
                onClick={() => setDateRange("365")}
              >
                All Data
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Currently showing data from the last {dateRange} days ({readings.length} readings)
            </p>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        {!loading && readings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Overview of your blood pressure data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Average BP</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.avgSystolic}/{stats.avgDiastolic}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Total Readings</p>
                  <p className="text-2xl font-bold text-green-800">{readings.length}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-600">High Readings</p>
                  <p className="text-2xl font-bold text-red-800">{stats.highReadings}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">With Symptoms</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.symptomsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>CSV Export</span>
              </CardTitle>
              <CardDescription>
                Export raw data in spreadsheet format for detailed analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All blood pressure measurements</li>
                <li>• Heart rate data</li>
                <li>• Contextual information (position, stress, etc.)</li>
                <li>• Notes and observations</li>
              </ul>
              <Button onClick={exportToCSV} className="w-full" disabled={loading || readings.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Healthcare Report</span>
              </CardTitle>
              <CardDescription>
                Generate a formatted report for your healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Summary statistics and trends</li>
                <li>• Patient and provider information</li>
                <li>• Recent readings with context</li>
                <li>• Clinical recommendations</li>
              </ul>
              <div className="flex space-x-2">
                <Button onClick={generateHealthcareReport} className="flex-1" disabled={loading || readings.length === 0}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={printReport} variant="outline" disabled={loading || readings.length === 0}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sharing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Sharing with Healthcare Providers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800">For Routine Appointments</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Export the CSV file or healthcare report and bring it to your appointment. 
                  This provides your doctor with comprehensive data for better care decisions.
                </p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                <h4 className="font-medium text-red-800">For Emergency Situations</h4>
                <p className="text-sm text-red-600 mt-1">
                  If you have consistently high readings (≥140/90) or concerning symptoms, 
                  contact your healthcare provider immediately. Do not wait for your next appointment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="font-medium text-gray-800">Emergency Contacts</h4>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Healthcare Provider: {profile?.healthcare_provider_name || "Not provided"}</p>
                    <p>Phone: {profile?.healthcare_provider_phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Emergency Contact</h4>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Contact: {profile?.emergency_contact_name || "Not provided"}</p>
                    <p>Phone: {profile?.emergency_contact_phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading your data...</p>
          </div>
        )}

        {!loading && readings.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No data available for the selected time period.</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking your blood pressure to generate reports.</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}