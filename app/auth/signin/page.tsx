import { DemoSignInForm } from "@/components/auth/demo-signin-form"
import { Heart, Shield, Smartphone } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding & Benefits */}
      <div className="lg:flex-1 bg-gradient-to-br from-pink-50 to-blue-50 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Pregnancy BP Tracker</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Monitor your health during pregnancy
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-6 w-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Track Blood Pressure</h3>
                <p className="text-gray-600">Easy logging and trend visualization for you and your healthcare provider.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                <p className="text-gray-600">Your health data is encrypted and protected with industry-standard security.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Smartphone className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Mobile Friendly</h3>
                <p className="text-gray-600">Access your data anywhere, anytime from your phone or computer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="lg:flex-1 p-8 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Access</h2>
            <p className="text-gray-600">Enter your details to try the application</p>
          </div>

          <DemoSignInForm />

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              This is a demo version. By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}