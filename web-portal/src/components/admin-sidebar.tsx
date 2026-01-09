"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Terminal,
  Database,
  Code,
  Key,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Primary navigation - Infrastructure Control Plane
const primaryNavigation = [
  { 
    title: "Console", 
    url: "/admin/overview", 
    icon: Terminal,
  },
  { 
    title: "Knowledge Ops", 
    url: "/admin/knowledge", 
    icon: Database,
  },
  { 
    title: "Network & Access", 
    url: "/admin/access", 
    icon: Key,
  },
  { 
    title: "Developer Hub", 
    url: "/admin/connect", 
    icon: Code,
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { user, role, logout } = useAuth()

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || "U"
    const names = user.displayName.split(" ")
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      : names[0].charAt(0).toUpperCase()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/admin/overview" className="flex items-center gap-3">
                <div className="flex aspect-square size-5 items-center justify-center rounded-lg bg-brand-ness text-white flex-shrink-0">
                  <span className="font-brand font-medium text-xs">n.</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-brand font-medium tracking-tight">
                    <span className="text-white">n.process</span>
                    <span className="text-[#00ade8]">.</span>
                  </span>
                  <span className="truncate text-xs text-zinc-500">Control Plane</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500">Infrastructure</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavigation.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        isActive && "border-l-2 border-brand-ness bg-transparent text-white",
                        !isActive && "text-zinc-400 hover:text-zinc-300"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className={cn(
                          "size-4",
                          isActive ? "text-white" : "text-zinc-500"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-brand-ness text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-white">
                        {user?.displayName || "Admin"}
                      </span>
                      {role && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-1.5 py-0 border-zinc-800",
                            role === 'super_admin' && 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                            role === 'admin' && 'bg-brand-ness/10 text-brand-ness border-brand-ness/30',
                            !['super_admin', 'admin'].includes(role) && 'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                          )}
                        >
                          {role === 'super_admin' ? '⭐ Super' : 
                           role === 'admin' ? '👑 Admin' :
                           role === 'finops_manager' ? '💰 FinOps' :
                           role === 'auditor' ? '🔍 Auditor' :
                           role === 'viewer' ? '👁️ Viewer' : '👤 User'}
                        </Badge>
                      )}
                    </div>
                    <span className="truncate text-xs text-zinc-500">
                      {user?.email || "Loading..."}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-zinc-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-900 border-zinc-800"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="text-zinc-300">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  className="text-red-400 focus:text-red-400 focus:bg-red-950/20"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
