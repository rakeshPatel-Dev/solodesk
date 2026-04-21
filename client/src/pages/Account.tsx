import { useMemo } from "react"
import { useSelector } from "react-redux"
import { ArrowRight, BadgeCheck, CalendarDays, Crown, LockKeyhole, PencilLine, Sparkles, ShieldCheck, Zap } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { RootState } from "@/store/store"

const activityItems = [
  {
    title: "Password refreshed",
    description: "You changed your password and kept the vault closed.",
    time: "12 minutes ago",
  },
  {
    title: "New device approved",
    description: "Your laptop signed in from Mumbai and stayed classy.",
    time: "Yesterday",
  },
  {
    title: "Profile polished",
    description: "Avatar, title, and bio were updated to the premium version.",
    time: "3 days ago",
  },
]

const accountHighlights = [
  { label: "Profile completeness", value: "84%", helper: "Almost there, darling.", icon: Sparkles },
  { label: "Security score", value: "A-", helper: "Strong, but not smug yet.", icon: ShieldCheck },
  { label: "Response time", value: "< 2h", helper: "Clients are spoiled.", icon: Zap },
  { label: "Plan status", value: "Pro", helper: "The good seats are yours.", icon: Crown },
]

const formatSince = (value?: string) => {
  if (!value) return "Recently"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

const Account = () => {
  const user = useSelector((state: RootState) => state.auth.user)

  const initials = useMemo(() => {
    const parts = user?.name?.split(" ").filter(Boolean) ?? []
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "S"
  }, [user?.name])

  const profileCompleteness = 84

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-4">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-6 text-white shadow-2xl shadow-black/20 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.22),transparent_34%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="border-white/15 bg-white/10 text-white">
                <BadgeCheck className="mr-1 size-3.5" />
                Account
              </Badge>
              <span className="text-xs uppercase tracking-[0.32em] text-white/60">Premium control room</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar size="lg" className="size-20 ring-4 ring-white/10">
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? "User avatar"} />
                <AvatarFallback className="bg-white/10 text-lg text-white">{initials}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {user?.name ?? "Your account"}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  This is your command center. Polish your profile, keep the vault locked, and make the app behave like it was custom-built for you. Because it should be.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                  <span>{user?.email ?? "No email on file"}</span>
                  <span className="text-white/30">•</span>
                  <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                    {user?.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                  <span className="text-white/30">•</span>
                  <span>Member since {formatSince(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Profile completeness</span>
              <span className="font-semibold text-white">{profileCompleteness}%</span>
            </div>
            <Progress value={profileCompleteness} className="h-2 bg-white/10" />
            <p className="text-xs leading-5 text-white/60">
              One avatar, one bio line, and a security review away from immaculate.
            </p>
            <Button className="mt-1 h-10 justify-between bg-white text-neutral-950 hover:bg-white/90">
              Edit profile
              <PencilLine className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accountHighlights.map((item) => (
          <Card key={item.label} className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.helper}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Profile essentials</CardTitle>
            <CardDescription>
              The polished little details that make the whole thing feel expensive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Full name</p>
                <p className="mt-2 text-base font-semibold text-foreground">{user?.name ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Email</p>
                <p className="mt-2 text-base font-semibold text-foreground">{user?.email ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Role</p>
                <p className="mt-2 text-base font-semibold text-foreground">{user?.role ?? "member"}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Status</p>
                <p className="mt-2 text-base font-semibold text-foreground">{user?.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-11 justify-between">
                Update profile photo
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" className="h-11 justify-between">
                Change password
                <LockKeyhole className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Security snapshot</CardTitle>
              <CardDescription>
                A quick read on how locked down the account is.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Last login</p>
                    <p className="text-sm text-muted-foreground">Most recent sign-in activity</p>
                  </div>
                  <CalendarDays className="size-5 text-primary" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "No login history yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Session hygiene</p>
                    <p className="text-sm text-muted-foreground">Cookie-based auth and protected routes</p>
                  </div>
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your session is anchored to the server cookie. Elegant, less fragile, and harder to steal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Recent activity</CardTitle>
              <CardDescription>
                A small trail of what the account has been up to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {activityItems.map((item, index) => (
                <div key={item.title} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-2.5 shrink-0 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <Badge variant="outline" className="border-border/60 text-xs text-muted-foreground">
                          {item.time}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {index < activityItems.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Account