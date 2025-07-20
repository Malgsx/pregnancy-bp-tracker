"use client"

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Plus, Heart, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
              <p className="text-2xl font-bold">--/--</p>
              <p className="text-sm text-gray-600">No readings yet</p>
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
              <p className="text-2xl font-bold">--/--</p>
              <p className="text-sm text-gray-600">Not enough data</p>
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
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">readings recorded</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>Your latest blood pressure measurements</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Health Insights</CardTitle>
              <CardDescription>Tips and recommendations for your pregnancy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Monitor regularly</p>
                  <p className="text-sm text-gray-600">
                    Track your blood pressure at least twice daily during pregnancy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Stay hydrated</p>
                  <p className="text-sm text-gray-600">
                    Proper hydration helps maintain healthy blood pressure levels.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Rest and relaxation</p>
                  <p className="text-sm text-gray-600">
                    Stress can affect your readings. Practice relaxation techniques.
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