"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { UserNav } from "@/components/auth/user-nav"
import { Save, User, Heart, Phone, Calendar, UserCheck } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone_number: string | null
  date_of_birth: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  healthcare_provider: string | null
  due_date: string | null
  pregnancy_start_date: string | null
  blood_pressure_target_systolic: number | null
  blood_pressure_target_diastolic: number | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
    
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Create initial profile
        const newProfile = {
          user_id: session?.user?.id || '',
          email: session?.user?.email || '',
          full_name: session?.user?.name,
          avatar_url: session?.user?.image,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)
        } else {
          setProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          date_of_birth: profile.date_of_birth,
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          healthcare_provider: profile.healthcare_provider,
          due_date: profile.due_date,
          pregnancy_start_date: profile.pregnancy_start_date,
          blood_pressure_target_systolic: profile.blood_pressure_target_systolic,
          blood_pressure_target_diastolic: profile.blood_pressure_target_diastolic,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session?.user?.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast.error("Failed to update profile")
      } else {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Error loading profile</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {profile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.full_name || "Complete your profile"}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone_number || ""}
                    onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.date_of_birth || ""}
                    onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pregnancy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Pregnancy Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pregnancyStart">Pregnancy Start Date</Label>
                  <Input
                    id="pregnancyStart"
                    type="date"
                    value={profile.pregnancy_start_date || ""}
                    onChange={(e) => setProfile({...profile, pregnancy_start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={profile.due_date || ""}
                    onChange={(e) => setProfile({...profile, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Blood Pressure Targets</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetSystolic" className="text-sm">Systolic (mmHg)</Label>
                    <Input
                      id="targetSystolic"
                      type="number"
                      placeholder="120"
                      value={profile.blood_pressure_target_systolic || ""}
                      onChange={(e) => setProfile({...profile, blood_pressure_target_systolic: e.target.value ? parseInt(e.target.value) : null})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetDiastolic" className="text-sm">Diastolic (mmHg)</Label>
                    <Input
                      id="targetDiastolic"
                      type="number"
                      placeholder="80"
                      value={profile.blood_pressure_target_diastolic || ""}
                      onChange={(e) => setProfile({...profile, blood_pressure_target_diastolic: e.target.value ? parseInt(e.target.value) : null})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Healthcare & Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Healthcare & Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="healthcare">Healthcare Provider</Label>
                <Textarea
                  id="healthcare"
                  placeholder="Dr. Smith - OB/GYN, City Hospital"
                  value={profile.healthcare_provider || ""}
                  onChange={(e) => setProfile({...profile, healthcare_provider: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={profile.emergency_contact_name || ""}
                    onChange={(e) => setProfile({...profile, emergency_contact_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={profile.emergency_contact_phone || ""}
                    onChange={(e) => setProfile({...profile, emergency_contact_phone: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="px-8">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}