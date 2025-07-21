"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Heart, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewReadingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heart_rate: "",
    position: "",
    arm_used: "",
    weight_kg: "",
    stress_level: "",
    sleep_hours: "",
    notes: "",
    activity_before_reading: "",
    medication_taken: false,
    felt_symptoms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    // Validation
    if (!formData.systolic || !formData.diastolic) {
      toast.error("Please enter both systolic and diastolic readings")
      return
    }

    const systolic = parseInt(formData.systolic)
    const diastolic = parseInt(formData.diastolic)

    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
      toast.error("Blood pressure values seem unusual. Please check your readings.")
      return
    }

    setSaving(true)

    try {
      const readingData = {
        user_id: session.user.id,
        systolic: systolic,
        diastolic: diastolic,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        reading_time: new Date().toISOString(),
        position: formData.position || null,
        arm_used: formData.arm_used || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        stress_level: formData.stress_level ? parseInt(formData.stress_level) : null,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
        notes: formData.notes || null,
        activity_before_reading: formData.activity_before_reading || null,
        medication_taken: formData.medication_taken,
        felt_symptoms: formData.felt_symptoms,
        is_manual_entry: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("blood_pressure_readings")
        .insert(readingData)

      if (error) {
        console.error("Error saving reading:", error)
        toast.error("Failed to save reading. Please try again.")
      } else {
        toast.success("Blood pressure reading saved successfully!")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to save reading. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedLayout title="New Reading">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Blood Pressure Reading</h1>
            <p className="text-gray-600">Record your latest measurement</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Pressure Readings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Blood Pressure</span>
              </CardTitle>
              <CardDescription>Enter your systolic and diastolic readings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic (mmHg) *</Label>
                  <Input
                    id="systolic"
                    type="number"
                    min="70"
                    max="250"
                    placeholder="120"
                    value={formData.systolic}
                    onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Top number (70-250)</p>
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic (mmHg) *</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    min="40"
                    max="150"
                    placeholder="80"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Bottom number (40-150)</p>
                </div>
                <div>
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    min="40"
                    max="200"
                    placeholder="72"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional (40-200)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Context */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Context</CardTitle>
              <CardDescription>Additional information about your reading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sitting">Sitting</SelectItem>
                      <SelectItem value="lying">Lying down</SelectItem>
                      <SelectItem value="standing">Standing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="arm_used">Arm Used</Label>
                  <Select value={formData.arm_used} onValueChange={(value) => setFormData({...formData, arm_used: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select arm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left arm</SelectItem>
                      <SelectItem value="right">Right arm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    placeholder="65.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="stress_level">Stress Level (1-10)</Label>
                  <Input
                    id="stress_level"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="5"
                    value={formData.stress_level}
                    onChange={(e) => setFormData({...formData, stress_level: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="sleep_hours">Sleep Last Night (hours)</Label>
                  <Input
                    id="sleep_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="8"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({...formData, sleep_hours: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity_before_reading">Activity Before Reading</Label>
                <Input
                  id="activity_before_reading"
                  placeholder="e.g., walking, resting, eating"
                  value={formData.activity_before_reading}
                  onChange={(e) => setFormData({...formData, activity_before_reading: e.target.value})}
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="medication_taken"
                    checked={formData.medication_taken}
                    onChange={(e) => setFormData({...formData, medication_taken: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="medication_taken">Took medication today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="felt_symptoms"
                    checked={formData.felt_symptoms}
                    onChange={(e) => setFormData({...formData, felt_symptoms: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="felt_symptoms">Felt symptoms</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this reading..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Reading"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  )
}