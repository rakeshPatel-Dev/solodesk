"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
  HandCoinsIcon,
  CheckSquareIcon,
  BarChart3Icon,
  SettingsIcon,
} from "lucide-react"
import { Separator } from "./ui/separator"
import { Link } from "react-router-dom"

// This is sample data.
const data = {
  user: {
    name: "Rikesh Patel",
    email: "rikesh@example.com",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <HouseIcon />
      ),
      isActive: true,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: (
        <UsersIcon />
      ),
      items: [
        {
          title: "All Clients",
          url: "/clients",
        },
        {
          title: "Add Client",
          url: "/clients/new",
        },
      ],
    },
    {
      title: "Projects",
      url: "/projects",
      icon: (
        <FolderKanbanIcon />
      ),
      items: [
        {
          title: "All Projects",
          url: "/projects",
        },
        {
          title: "Add Project",
          url: "/projects/new",
        },
      ],
    },
    {
      title: "Payments",
      url: "/payments",
      icon: (
        <HandCoinsIcon />
      ),
      items: [
        {
          title: "All Payments",
          url: "/payments",
        },
        {
          title: "Add Payment",
          url: "/payments/new",
        },
      ],
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: (
        <CheckSquareIcon />
      ),
      items: [
        {
          title: "All Tasks",
          url: "/tasks",
        },
      ],
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Solodesk">
              <Link to="/dashboard" className="gap-3">
                <img
                  src="/solodesk logo.svg"
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
              <a href="/settings">
                <SettingsIcon />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
