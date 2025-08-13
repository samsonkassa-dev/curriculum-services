"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Login } from "@curriculum-services/auth"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [redirect, setRedirect] = useState<string>("/")

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      setRedirect(sp.get('redirect') || '/')
    } catch {}
  }, [])

  return (
    <div className="min-h-screen">
      <Login onSuccess={() => router.replace(redirect)} />
    </div>
  )
}


