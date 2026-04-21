import * as React from "react"
import { useTheme } from "next-themes"
import { useSelector } from "react-redux"
import {
  BellIcon,
  Crown,
  LockKeyhole,
  MonitorCogIcon,
  MoonStarIcon,
  PaintbrushVertical,
  ShieldCheckIcon,
  Sparkles,
  SunIcon,
  Volume2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { RootState } from "@/store/store"

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
  const user = useSelector((state: RootState) => state.auth.user)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = mounted ? (theme as ThemeValue) : "system"
  const activeResolvedTheme = mounted ? resolvedTheme : "light"
  const settingsReadiness = 78

  const preferenceItems = [
    {
      title: "Notifications",
      description: "Pick what pings you and what politely shuts up.",
      icon: BellIcon,
      action: "Tune alerts",
    },
    {
      title: "Security",
      description: "Sessions, devices, and trust settings in one place.",
      icon: ShieldCheckIcon,
      action: "Review sessions",
    },
    {
      title: "Sound",
      description: "Soft clicks or full silence, your call.",
      icon: Volume2,
      action: "Adjust sound",
    },
    {
      title: "Profile style",
      description: "Polish the vibe with visual and copy presets.",
      icon: PaintbrushVertical,
      action: "Customize look",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-4">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-cyan-950 via-slate-900 to-neutral-900 p-6 text-white shadow-2xl shadow-black/20 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_35%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="border-white/15 bg-white/10 text-white">
                <Sparkles className="mr-1 size-3.5" />
                Settings
              </Badge>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60">Sassy control suite</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tune the vibe, not just the toggles.</h1>
              <p className="max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
                Your workspace personality lives here. Theme, alerts, and security posture all get the premium treatment. Keep it sharp, keep it yours.
              </p>
              <p className="text-sm text-white/80">
                Signed in as <span className="font-semibold text-white">{user?.name ?? "Solodesk user"}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Settings readiness</span>
              <span className="font-semibold text-white">{settingsReadiness}%</span>
            </div>
            <Progress value={settingsReadiness} className="h-2 bg-white/10" />
            <p className="text-xs leading-5 text-white/60">
              A couple of preferences and your control center becomes immaculate.
            </p>
            <Button className="mt-1 h-10 justify-between bg-white text-slate-950 hover:bg-white/90">
              Upgrade your defaults
              <Crown className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Appearance mode</CardTitle>
            <CardDescription>
              Pick how Solodesk looks when you are winning at 10 AM and surviving at 2 AM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="text-xs text-muted-foreground">
              Active mode: <span className="font-medium text-foreground capitalize">{activeResolvedTheme}</span>
              {activeTheme === "system" ? " (following system setting)" : ""}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const isActive = activeTheme === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="h-auto min-h-20 justify-start gap-3 whitespace-normal px-4 py-3 text-left"
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

            <Separator />

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <MonitorCogIcon className="mt-0.5 size-4 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Auto-follow system appearance</p>
                  <p className="text-sm text-muted-foreground">
                    Use system mode when you want Solodesk to sync with your OS schedule and keep transitions effortless.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Security moodboard</CardTitle>
              <CardDescription>
                Practical protection, still dressed well.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">Session protection</p>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cookie-based sessions are active. Safer than exposing tokens to browser storage.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">Credential hygiene</p>
                  <LockKeyhole className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Rotate your password regularly and review active devices from account controls.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {preferenceItems.map((item) => (
          <Card key={item.title} className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button variant="outline" className="mt-auto justify-between">
                {item.action}
                <Sparkles className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default Settings
