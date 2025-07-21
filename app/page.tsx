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
    <div className="min-h-screen gradient-medical">
      {/* Navigation */}
      <nav className="glass-card sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-pink-500 drop-shadow-sm" />
              <span className="heading-responsive text-gray-900 font-bold tracking-tight">
                Pregnancy BP Tracker
              </span>
            </div>
            <Button variant="pregnancy" size="lg" asChild>
              <SignInButton provider="google">
                Get Started
              </SignInButton>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-pink-100/80 text-pink-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant & Secure</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Monitor Your Health
            <span className="block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              During Pregnancy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Track your blood pressure safely and easily throughout your pregnancy journey. 
            Share comprehensive data with healthcare providers and get insights that matter most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="pregnancy" size="xl" asChild>
              <SignInButton provider="google">
                <Heart className="mr-2 h-5 w-5" />
                Start Tracking Today
              </SignInButton>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <SignInButton provider="apple">
                <Smartphone className="mr-2 h-5 w-5" />
                Continue with Apple
              </SignInButton>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Trusted by 10k+ Families</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Healthcare Provider Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Everything You Need for 
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Safe Monitoring</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed specifically for expectant parents to track, 
              analyze, and share blood pressure data with healthcare providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Log blood pressure readings quickly with our intuitive interface. 
                Include notes, symptoms, and context for complete records.
              </p>
            </div>

            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BarChart3 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trend Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize your blood pressure trends over time with interactive charts. 
                Spot patterns and changes throughout your pregnancy.
              </p>
            </div>

            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Healthcare Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Export your data to share with healthcare providers. 
                Enable better communication and more informed decisions.
              </p>
            </div>

            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your health data is encrypted and protected. We follow strict 
                privacy standards to keep your information safe.
              </p>
            </div>

            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Smartphone className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your data anywhere, anytime. Optimized for mobile devices 
                so you can track on the go.
              </p>
            </div>

            <div className="glass-card text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Reminders</h3>
              <p className="text-gray-600 leading-relaxed">
                Set up personalized reminders to help maintain consistent 
                monitoring throughout your pregnancy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 via-rose-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Start Your 
            <span className="block">Monitoring Journey?</span>
          </h2>
          <p className="text-xl md:text-2xl text-pink-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of expectant parents who trust our platform 
            for comprehensive pregnancy health monitoring and insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="outline" size="xl" className="bg-white/95 text-gray-900 hover:bg-white border-white/20 backdrop-blur-sm" asChild>
              <SignInButton provider="google">
                <Heart className="mr-3 h-5 w-5 text-pink-500" />
                Get Started with Google
              </SignInButton>
            </Button>
            <Button variant="outline" size="xl" className="bg-black/80 text-white hover:bg-black/90 border-white/20 backdrop-blur-sm" asChild>
              <SignInButton provider="apple">
                <Smartphone className="mr-3 h-5 w-5" />
                Continue with Apple
              </SignInButton>
            </Button>
          </div>
          
          {/* Additional trust signals */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-pink-100">Expecting Parents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-pink-100">BP Readings Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-pink-100">Healthcare Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Heart className="h-8 w-8 text-pink-400" />
              <span className="text-2xl font-bold">Pregnancy BP Tracker</span>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Empowering healthy pregnancies through intelligent monitoring, 
              trusted by healthcare providers worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 mb-8">
              <a href="/privacy" className="hover:text-white transition-colors flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </a>
              <a href="/terms" className="hover:text-white transition-colors flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Terms of Service</span>
              </a>
              <a href="/support" className="hover:text-white transition-colors flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Support</span>
              </a>
              <a href="/about" className="hover:text-white transition-colors flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span>About Us</span>
              </a>
            </div>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-500 text-sm">
                © 2025 Pregnancy BP Tracker. Made with ❤️ for expecting families everywhere.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}