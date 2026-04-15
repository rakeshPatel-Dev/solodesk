import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const location = useLocation()

  const isItemActive = (url: string) => {
    if (url === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }

    return location.pathname === url || location.pathname.startsWith(`${url}/`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive(item.url)}>
              <Link to={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
