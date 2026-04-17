"use client"

import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  HouseIcon,
  UsersIcon,
  FolderKanbanIcon,
  BarChart3Icon,
  SettingsIcon,
} from "lucide-react"
import { Separator } from "../ui/separator"
import { Link } from "react-router-dom"
import { logout as clearAuth } from "@/store/features/authSlice"
import { logout as logoutRequest } from "@/api/auth/login"
import type { RootState } from "@/store/store"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <HouseIcon />
      ),
    },
    {
      title: "Clients",
      url: "/clients",
      icon: (
        <UsersIcon />
      ),
    },
    {
      title: "Projects",
      url: "/projects",
      icon: (
        <FolderKanbanIcon />
      ),
    },
    {
      title: "Reports",
      url: "/reports",
      icon: (
        <BarChart3Icon />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      dispatch(clearAuth())
      navigate("/auth/login", { replace: true })
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Solodesk">
              <Link to="/dashboard" className="gap-3">
                <img
                  src="/solodesk-logo.svg"
                  alt="Solodesk logo"
                  className="size-8 rounded-md object-contain"
                />
                <div className="grid text-left leading-tight">
                  <span className="truncate font-semibold">Solodesk</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Freelance Management System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings">
                <SettingsIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
        <NavUser
          user={
            user ?? {
              name: "Guest user",
              email: "guest@solodesk.app",
              avatar: null,
            }
          }
          onLogout={handleLogout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
