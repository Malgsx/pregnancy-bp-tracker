"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { Settings, Bell, Shield, Download, Trash2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface UserSettings {
  measurement_unit: string
  timezone: string
  notification_preferences: {
    daily_reminders: boolean
    weekly_reports: boolean
    high_reading_alerts: boolean
    appointment_reminders: boolean
  }
  bp_target_systolic: number | null
  bp_target_diastolic: number | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    measurement_unit: "mmHg",
    timezone: "UTC",
    notification_preferences: {
      daily_reminders: true,
      weekly_reports: false,
      high_reading_alerts: true,
      appointment_reminders: true
    },
    bp_target_systolic: 120,
    bp_target_diastolic: 80
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("measurement_unit, timezone, notification_preferences, bp_target_systolic, bp_target_diastolic")
        .eq("user_id", session?.user?.id)
        .single()

      if (error) {
        console.error("Error fetching settings:", error)
      } else if (data) {
        setSettings({
          measurement_unit: data.measurement_unit || "mmHg",
          timezone: data.timezone || "UTC",
          notification_preferences: data.notification_preferences || settings.notification_preferences,
          bp_target_systolic: data.bp_target_systolic,
          bp_target_diastolic: data.bp_target_diastolic
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          measurement_unit: settings.measurement_unit,
          timezone: settings.timezone,
          notification_preferences: settings.notification_preferences,
          bp_target_systolic: settings.bp_target_systolic,
          bp_target_diastolic: settings.bp_target_diastolic,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", session?.user?.id)

      if (error) {
        console.error("Error saving settings:", error)
        toast.error("Failed to save settings")
      } else {
        toast.success("Settings saved successfully!")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const exportAllData = async () => {
    try {
      const { data: readings, error } = await supabase
        .from("blood_pressure_readings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .eq("is_deleted", false)
        .order("reading_time", { ascending: false })

      if (error) {
        console.error("Error fetching readings:", error)
        toast.error("Failed to export data")
        return
      }

      if (!readings || readings.length === 0) {
        toast.error("No data to export")
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
        "Sleep Hours",
        "Medication Taken",
        "Felt Symptoms",
        "Notes"
      ]

      const csvContent = [
        headers.join(","),
        ...readings.map(reading => [
          `"${new Date(reading.reading_time).toISOString()}"`,
          reading.systolic,
          reading.diastolic,
          reading.heart_rate || "",
          `"${reading.position || ""}"`,
          reading.weight_kg || "",
          reading.stress_level || "",
          reading.sleep_hours || "",
          reading.medication_taken ? "Yes" : "No",
          reading.felt_symptoms ? "Yes" : "No",
          `"${reading.notes || ""}"`
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `complete-bp-data-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      
      toast.success("All data exported successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to export data")
    }
  }

  const deleteAllData = async () => {
    if (!confirm("Are you sure you want to delete ALL your blood pressure data? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("blood_pressure_readings")
        .update({ is_deleted: true })
        .eq("user_id", session?.user?.id)

      if (error) {
        console.error("Error deleting data:", error)
        toast.error("Failed to delete data")
      } else {
        toast.success("All data has been deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete data")
    }
  }

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago", 
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney"
  ]

  return (
    <ProtectedLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your blood pressure tracking experience</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Measurement Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Measurement Preferences</span>
                </CardTitle>
                <CardDescription>Configure how your blood pressure data is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="measurement_unit">Blood Pressure Unit</Label>
                    <Select 
                      value={settings.measurement_unit} 
                      onValueChange={(value) => setSettings({...settings, measurement_unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mmHg">mmHg (Millimeters of mercury)</SelectItem>
                        <SelectItem value="kPa">kPa (Kilopascals)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => setSettings({...settings, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_systolic">Target Systolic (mmHg)</Label>
                    <Input
                      id="target_systolic"
                      type="number"
                      min="90"
                      max="180"
                      value={settings.bp_target_systolic || ""}
                      onChange={(e) => setSettings({
                        ...settings, 
                        bp_target_systolic: e.target.value ? parseInt(e.target.value) : null
                      })}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_diastolic">Target Diastolic (mmHg)</Label>
                    <Input
                      id="target_diastolic"
                      type="number"
                      min="60"
                      max="120"
                      value={settings.bp_target_diastolic || ""}
                      onChange={(e) => setSettings({
                        ...settings, 
                        bp_target_diastolic: e.target.value ? parseInt(e.target.value) : null
                      })}
                      placeholder="80"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Choose when and how you want to be reminded</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(settings.notification_preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {key.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === "daily_reminders" && "Get reminded to take your blood pressure readings"}
                          {key === "weekly_reports" && "Receive weekly summaries of your readings"}
                          {key === "high_reading_alerts" && "Get notified when readings are elevated"}
                          {key === "appointment_reminders" && "Reminders for upcoming healthcare appointments"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          notification_preferences: {
                            ...settings.notification_preferences,
                            [key]: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Export or manage your blood pressure data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button onClick={exportAllData} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button 
                    onClick={deleteAllData} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Data Privacy:</strong> Your blood pressure data is stored securely and encrypted. 
                    You can export or delete your data at any time. Deleted data cannot be recovered.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Settings */}
            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}