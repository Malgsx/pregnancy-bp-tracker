"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
  provider: "google" | "apple"
  className?: string
  children?: React.ReactNode
}

export function SignInButton({ provider, className, children }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  const providerNames = {
    google: "Google",
    apple: "Apple"
  }

  return (
    <Button
      onClick={handleSignIn}
      className={className}
      variant="outline"
    >
      {children || `Sign in with ${providerNames[provider]}`}
    </Button>
  )
}