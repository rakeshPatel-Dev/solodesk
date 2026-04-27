import { ArrowRight, CalendarDays, Crown, LockKeyhole, ShieldCheck, Sparkles, Zap, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { AuthUser } from "@/store/authStorage"

type AccountOverviewProps = {
  user: AuthUser | null
  profileCompleteness: number
  onEditProfile: () => void
}

const activityItems = [
  {
    title: "Password refreshed",
    description: "You changed your password and kept the vault closed.",
    time: "12 minutes ago",
    icon: LockKeyhole,
  },
  {
    title: "New device approved",
    description: "Your laptop signed in from Mumbai and stayed classy.",
    time: "Yesterday",
    icon: ShieldCheck,
  },
  {
    title: "Profile polished",
    description: "Avatar, title, and bio were updated to the premium version.",
    time: "3 days ago",
    icon: Sparkles,
  },
]

export function AccountOverview({ user, profileCompleteness, onEditProfile }: AccountOverviewProps) {
  const getCompletenessColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 50) return "text-amber-500"
    return "text-rose-500"
  }

  const getCompletenessIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="size-5" />
    if (score >= 50) return <TrendingUp className="size-5" />
    return <AlertCircle className="size-5" />
  }

  const accountHighlights = [
    {
      label: "Profile completeness",
      value: `${profileCompleteness}%`,
      helper: profileCompleteness >= 90 ? "Excellent! Profile is fully optimized." : profileCompleteness >= 50 ? "Getting there. Add more details." : "Start by completing your profile.",
      icon: Sparkles,
      color: getCompletenessColor(profileCompleteness),
      trendIcon: getCompletenessIcon(profileCompleteness),
    },
    {
      label: "Security score",
      value: profileCompleteness >= 80 ? "A" : profileCompleteness >= 50 ? "B+" : "C",
      helper: profileCompleteness >= 80 ? "Top-tier security posture." : profileCompleteness >= 50 ? "Good, but room for improvement." : "Complete profile to improve security.",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    {
      label: "Response SLA",
      value: "< 2h",
      helper: "Average response time for support tickets.",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Current plan",
      value: user?.role === "admin" ? "Enterprise" : "Pro",
      helper: user?.role === "admin" ? "Unlimited access & priority support" : "Upgrade for more features",
      icon: Crown,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Highlights Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accountHighlights.map((item) => (
          <Card
            key={item.label}
            className="group border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color.replace('text', 'bg')}/10 transition-all duration-300 group-hover:scale-110`}>
                  <item.icon className={`size-5 ${item.color}`} />
                </div>
                {item.trendIcon && (
                  <div className={`${item.color}`}>
                    {item.trendIcon}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className={`text-3xl font-bold tracking-tight ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {item.helper}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Profile Essentials */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Profile essentials</CardTitle>
                <CardDescription className="mt-1.5">
                  Your core identity and access settings
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {profileCompleteness}% complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Full name", value: user?.name ?? "—", icon: "👤" },
                { label: "Email address", value: user?.email ?? "—", icon: "📧" },
                { label: "Role", value: user?.role === "admin" ? "Administrator" : "Team Member", icon: "⚡" },
                { label: "Account status", value: user?.isActive ? "Active" : "Inactive", icon: "🟢", color: user?.isActive ? "text-emerald-500" : "text-rose-500" },
              ].map((field) => (
                <div
                  key={field.label}
                  className="group rounded-xl border border-border/60 bg-card/30 p-4 transition-all duration-200 hover:border-border/80 hover:bg-card/50"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className={`text-sm font-semibold text-foreground ${field.color || ''}`}>
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/40" />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="group h-11 justify-between border-border/60 bg-card/50 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                onClick={onEditProfile}
              >
                Edit profile
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                className="group h-11 justify-between border-border/60 bg-card/50 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              >
                Change password
                <LockKeyhole className="size-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Security Snapshot */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold tracking-tight">Security snapshot</CardTitle>
              <CardDescription className="mt-1">
                Your account's current security posture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4 transition-all duration-200 hover:border-primary/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Last login</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "No login history yet"}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2.5">
                    <CalendarDays className="size-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/30 p-4 transition-all duration-200 hover:border-border/80">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <ShieldCheck className="size-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Session hygiene</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Cookie-based authentication with HTTP-only flags. Your session is secure against XSS attacks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold tracking-tight">Recent activity</CardTitle>
              <CardDescription className="mt-1">
                Latest actions on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {activityItems.map((item, index) => (
                <div key={item.title} className="group space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-1.5 transition-all duration-200 group-hover:bg-primary/20">
                      <item.icon className="size-3.5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <Badge
                          variant="outline"
                          className="border-border/60 bg-card/50 text-[11px] font-normal text-muted-foreground"
                        >
                          {item.time}
                        </Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {index < activityItems.length - 1 && <Separator className="bg-border/40" />}
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                View full activity log
                <ArrowRight className="ml-1 size-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}