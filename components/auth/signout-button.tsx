"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      className={className}
    >
      {children || "Sign out"}
    </Button>
  )
}