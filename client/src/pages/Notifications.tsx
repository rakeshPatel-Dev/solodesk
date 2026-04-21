import { useMemo, useState } from "react"
import { BellRing, Clock3, Crown, Filter, Inbox, Mail, Megaphone, MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

type NotificationItem = {
  id: string
  title: string
  detail: string
  time: string
  type: "billing" | "project" | "security"
  unread?: boolean
}

const seedNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Invoice paid instantly",
    detail: "Nova Labs settled Invoice INV-482. Money landed. Mood lifted.",
    time: "8 min ago",
    type: "billing",
    unread: true,
  },
  {
    id: "n-2",
    title: "Project timeline shifted",
    detail: "Brand Revamp deadline moved to Friday. You still look in control.",
    time: "1h ago",
    type: "project",
    unread: true,
  },
  {
    id: "n-3",
    title: "New sign-in confirmed",
    detail: "Secure login from your main laptop. Fingerprints and elegance verified.",
    time: "Yesterday",
    type: "security",
  },
  {
    id: "n-4",
    title: "Client sent feedback",
    detail: "Acme Studio loved the v2 deck and wants final copy polish.",
    time: "2 days ago",
    type: "project",
  },
]

const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [billingAlerts, setBillingAlerts] = useState(true)
  const [projectAlerts, setProjectAlerts] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [marketingAlerts, setMarketingAlerts] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "billing" | "project" | "security">("all")

  const unreadCount = useMemo(() => seedNotifications.filter((item) => item.unread).length, [])

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "all") {
      return seedNotifications
    }
    return seedNotifications.filter((item) => item.type === selectedFilter)
  }, [selectedFilter])

  const coverageScore = [emailAlerts, billingAlerts, projectAlerts, securityAlerts].filter(Boolean).length * 25

  const filterButtonClass = (active: boolean) =>
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border/60 bg-background text-muted-foreground hover:text-foreground"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-4">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-emerald-950 via-slate-900 to-neutral-900 p-6 text-white shadow-2xl shadow-black/20 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.24),transparent_38%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="border-white/15 bg-white/10 text-white">
                <BellRing className="mr-1 size-3.5" />
                Notifications
              </Badge>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60">Signal, not noise</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your inbox, but with standards.</h1>
            <p className="max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
              Keep the updates that matter, mute the rest, and stay dramatically informed without drowning in pings.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                <Inbox className="mr-1 size-3.5" />
                {unreadCount} unread
              </Badge>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                <ShieldCheck className="mr-1 size-3.5" />
                Priority routing enabled
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Coverage score</span>
              <span className="font-semibold text-white">{coverageScore}%</span>
            </div>
            <Progress value={coverageScore} className="h-2 bg-white/10" />
            <p className="text-xs leading-5 text-white/60">
              Turn on the channels you trust. Keep your attention expensive.
            </p>
            <Button className="mt-1 h-10 justify-between bg-white text-emerald-950 hover:bg-white/90">
              Upgrade delivery logic
              <Crown className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Live feed</CardTitle>
            <CardDescription>
              The updates worth your time, filtered by mood and importance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className={filterButtonClass(selectedFilter === "all")} onClick={() => setSelectedFilter("all")}>
                <Filter className="size-3.5" />
                All
              </Button>
              <Button variant="outline" size="sm" className={filterButtonClass(selectedFilter === "billing")} onClick={() => setSelectedFilter("billing")}>
                <Zap className="size-3.5" />
                Billing
              </Button>
              <Button variant="outline" size="sm" className={filterButtonClass(selectedFilter === "project")} onClick={() => setSelectedFilter("project")}>
                <MessageSquare className="size-3.5" />
                Projects
              </Button>
              <Button variant="outline" size="sm" className={filterButtonClass(selectedFilter === "security")} onClick={() => setSelectedFilter("security")}>
                <ShieldCheck className="size-3.5" />
                Security
              </Button>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map((item, index) => (
                <div key={item.id} className="space-y-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          {item.unread ? <Badge className="h-5 bg-primary/90">New</Badge> : null}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        {item.time}
                      </span>
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Delivery channels</CardTitle>
              <CardDescription>
                Choose what reaches you and how loud it should be.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <p className="font-medium text-foreground">Email alerts</p>
                  <p className="text-xs text-muted-foreground">Daily summary and critical updates</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} aria-label="Toggle email alerts" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <p className="font-medium text-foreground">Billing alerts</p>
                  <p className="text-xs text-muted-foreground">Invoices, payments, and due reminders</p>
                </div>
                <Switch checked={billingAlerts} onCheckedChange={setBillingAlerts} aria-label="Toggle billing alerts" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <p className="font-medium text-foreground">Project alerts</p>
                  <p className="text-xs text-muted-foreground">Status changes and collaborator mentions</p>
                </div>
                <Switch checked={projectAlerts} onCheckedChange={setProjectAlerts} aria-label="Toggle project alerts" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <p className="font-medium text-foreground">Security alerts</p>
                  <p className="text-xs text-muted-foreground">Sign-ins, suspicious activity, policy changes</p>
                </div>
                <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} aria-label="Toggle security alerts" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <p className="font-medium text-foreground">Marketing updates</p>
                  <p className="text-xs text-muted-foreground">Feature drops and growth tips</p>
                </div>
                <Switch checked={marketingAlerts} onCheckedChange={setMarketingAlerts} aria-label="Toggle marketing alerts" />
              </label>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Tone and cadence</CardTitle>
              <CardDescription>
                Fast and focused by default, extra sparkle optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Work hours digest</p>
                <p className="mt-1">Mon to Fri, 9:00 AM to 6:00 PM in your local time.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Priority override</p>
                <p className="mt-1">Security and payment alerts bypass quiet mode automatically.</p>
              </div>
              <Button className="mt-1 h-10 justify-between">
                Save preferences
                <Sparkles className="size-4" />
              </Button>
              <Button variant="outline" className="h-10 justify-between">
                Test notification now
                <Mail className="size-4" />
              </Button>
              <Button variant="ghost" className="h-10 justify-between text-muted-foreground hover:text-foreground">
                Campaign announcements
                <Megaphone className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Notifications