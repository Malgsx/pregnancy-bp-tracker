"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Loader2 } from "lucide-react"

export function DemoSignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("demo@example.com")
  const [name, setName] = useState("Demo User")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        name,
        redirect: false,
      })

      if (result?.ok) {
        window.location.href = "/dashboard"
      } else {
        console.error("Sign in failed:", result?.error)
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="demo@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Start Demo</span>
          </div>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          No registration required - this is a demonstration version
        </p>
      </div>
    </form>
  )
}