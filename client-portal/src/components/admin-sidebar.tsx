"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Key,
  Users,
  DollarSign,
  Server,
  Settings,
  LogOut,
  ChevronRight,
  Terminal,
  Database,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
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
import {
  Collapsible,
} from "@/components/ui/collapsible"

const navigation = [
  { 
    title: "Overview", 
    url: "/admin/overview", 
    icon: LayoutDashboard,
  },
  { 
    title: "Knowledge", 
    url: "/admin/knowledge", 
    icon: Database,
  },
  { 
    title: "API Keys", 
    url: "/admin/api-keys", 
    icon: Key,
  },
  { 
    title: "Consumers", 
    url: "/admin/consumers", 
    icon: Users,
  },
  { 
    title: "FinOps", 
    url: "/admin/finops", 
    icon: DollarSign,
  },
  { 
    title: "Services", 
    url: "/admin/services", 
    icon: Server,
  },
  {
    title: "Developers",
    url: "/admin/developers/prompts",
    icon: Terminal,
  },
  { 
    title: "Settings", 
    url: "/admin/settings", 
    icon: Settings,
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { user, logout } = useAuth()

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
              <Link href="/admin/overview">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">n.</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold font-montserrat">
                    <span>n</span>
                    <span className="text-[#00ade8]">.</span>
                    <span>process</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">Admin Console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className={cn(
                          "size-4",
                          isActive && "text-[#00ade8]"
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
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.displayName || "Admin"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || "Loading..."}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
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
