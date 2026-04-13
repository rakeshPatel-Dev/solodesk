import * as React from "react"
import { useTheme } from "next-themes"
import { MonitorCogIcon, MoonStarIcon, SunIcon, BellIcon, ShieldCheckIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const themeOptions = [
  {
    value: "light",
    label: "Light",
    description: "Always use light mode.",
    icon: <SunIcon className="size-4" />,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark mode.",
    icon: <MoonStarIcon className="size-4" />,
  },
  {
    value: "system",
    label: "System",
    description: "Use your OS appearance setting.",
    icon: <MonitorCogIcon className="size-4" />,
  },
] as const

type ThemeValue = (typeof themeOptions)[number]["value"]

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = mounted ? (theme as ThemeValue) : "system"
  const activeResolvedTheme = mounted ? resolvedTheme : "light"

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Pick how Solodesk looks across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-xs text-muted-foreground">
            Active mode: <span className="font-medium text-foreground capitalize">{activeResolvedTheme}</span>
            {activeTheme === "system" ? " (from system setting)" : ""}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const isActive = activeTheme === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={isActive}
                >
                  {option.icon}
                  <span className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs opacity-80">{option.description}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Email and in-app updates for projects and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
          <BellIcon className="mt-0.5 size-4" />
          <p>
            Notification channels and schedules can be configured here next.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Login sessions and account protection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4" />
          <p>
            Two-factor auth and device session management can be added here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings
