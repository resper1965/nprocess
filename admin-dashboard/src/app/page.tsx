"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/overview")
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Carregando...</div>
    </div>
  )
}

