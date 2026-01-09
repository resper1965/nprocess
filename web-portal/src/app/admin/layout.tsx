"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

// Map routes to page titles
const getPageTitle = (pathname: string): string => {
  const routeMap: Record<string, string> = {
    '/admin/overview': 'Console',
    '/admin/knowledge': 'Knowledge Ops',
    '/admin/access': 'Network & Access',
    '/admin/connect': 'Developer Hub',
    '/admin/settings': 'Settings',
    '/admin/services': 'Services',
    '/admin/finops': 'FinOps',
    '/admin/api-keys': 'API Keys',
  }
  
  return routeMap[pathname] || 'Admin Console'
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!isAdmin) {
        // Redirect non-admins to main dashboard
        router.push("/dashboard")
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="font-brand font-medium text-lg text-zinc-300">{pageTitle}</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
