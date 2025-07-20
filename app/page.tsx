"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SignInButton } from "@/components/auth/signin-button"
import { Heart, Shield, Smartphone, BarChart3, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-900">Pregnancy BP Tracker</span>
            </div>
            <SignInButton provider="google" className="bg-pink-500 hover:bg-pink-600 text-white">
              Get Started
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Monitor Your Health
            <span className="block text-pink-500">During Pregnancy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track your blood pressure safely and easily throughout your pregnancy journey. 
            Share data with healthcare providers and get insights that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton 
              provider="google" 
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg"
            >
              Start Tracking Today
            </SignInButton>
            <SignInButton 
              provider="apple" 
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
            >
              Continue with Apple
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Safe Monitoring
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for pregnant individuals to track, 
              analyze, and share blood pressure data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Tracking</h3>
              <p className="text-gray-600">
                Log blood pressure readings quickly with our intuitive interface. 
                Include notes, symptoms, and context for complete records.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trend Analysis</h3>
              <p className="text-gray-600">
                Visualize your blood pressure trends over time with interactive charts. 
                Spot patterns and changes throughout your pregnancy.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Healthcare Integration</h3>
              <p className="text-gray-600">
                Export your data to share with healthcare providers. 
                Enable better communication and more informed decisions.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your health data is encrypted and protected. We follow strict 
                privacy standards to keep your information safe.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Friendly</h3>
              <p className="text-gray-600">
                Access your data anywhere, anytime. Optimized for mobile devices 
                so you can track on the go.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Reminders</h3>
              <p className="text-gray-600">
                Set up personalized reminders to help maintain consistent 
                monitoring throughout your pregnancy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of expectant parents who trust our platform 
            for their pregnancy health monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton 
              provider="google" 
              className="bg-white text-pink-500 hover:bg-gray-50 px-8 py-4 text-lg"
            >
              Get Started with Google
            </SignInButton>
            <SignInButton 
              provider="apple" 
              className="bg-black text-white hover:bg-gray-900 px-8 py-4 text-lg"
            >
              Continue with Apple
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold">Pregnancy BP Tracker</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering healthy pregnancies through smart monitoring.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}