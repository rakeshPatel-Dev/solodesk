import { BadgeCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import type { AuthUser } from "@/store/authStorage"

function formatSince(value?: string) {
  if (!value) return "Recently"

  const date = new Date(value)
  if (isNaN(date.getTime())) return "Recently"

  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

type AccountHeroProps = {
  user: AuthUser | null
  initials: string
  profileCompleteness: number
  completenessSummary: string
  completenessDescription: string
  completenessToneClassName: string
  isRemovingAvatar: boolean
  onEditProfile: () => void
  onRemoveAvatar: () => Promise<void>
}

export function AccountHero({
  user,
  initials,
  profileCompleteness,
  completenessSummary,
  completenessDescription,
  completenessToneClassName,
  isRemovingAvatar,
  onEditProfile,
  onRemoveAvatar,
}: AccountHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-4 sm:p-6 lg:p-8 text-white shadow-2xl shadow-black/20">
      {/* Background gradient effects - optimized for mobile */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_40%)] sm:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.22),transparent_34%)]" />

      <div className="relative grid gap-5 sm:gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start gap-y-6">
        {/* Left section - User info */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Badges row - responsive */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="border-white/15 bg-white/10 text-white text-xs sm:text-sm">
              <BadgeCheck className="mr-1 size-3 sm:size-3.5" />
              Account
            </Badge>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.32em] text-white/60">
              Premium control room
            </span>
          </div>

          {/* Avatar and name section - fully responsive */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* Avatar container with improved mobile touch targets */}
            <div className="relative mx-auto sm:mx-0">
              <Avatar
                size="default"
                className="size-20 sm:size-24 md:size-28 lg:size-30 rounded-lg ring-2 sm:ring-4 ring-white/10 transition-transform hover:scale-105"
              >
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? "User avatar"} className="rounded-lg" />
                <AvatarFallback className="rounded-lg bg-white/10 text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Dropdown trigger with larger touch area on mobile */}
              <div className="absolute -bottom-2 -right-2 sm:-bottom-1 sm:-right-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex cursor-pointer items-center justify-center rounded-full bg-primary p-2 sm:p-1.5 ring-2 ring-white/20 transition-all hover:scale-110 hover:bg-primary/80 active:scale-95"
                      aria-label="Change profile picture"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-black sm:hidden"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hidden text-black sm:block"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48 sm:w-52">
                    <DropdownMenuItem onClick={onEditProfile} className="text-sm sm:text-base">
                      Edit profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={!user?.avatar || isRemovingAvatar}
                      onClick={() => {
                        void onRemoveAvatar()
                      }}
                      className="text-sm sm:text-base"
                    >
                      {isRemovingAvatar ? "Removing..." : "Remove profile"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* User info text - responsive typography */}
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight wrap-break-words">
                {user?.name ?? "Your account"}
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed sm:leading-6 text-white/70 max-w-2xl">
                This is your command center. Polish your profile, keep the vault locked, and make the app behave like it was custom-built for you.
              </p>

              {/* User metadata - responsive wrap */}
              <div className="flex flex-wrap flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-x-2 gap-y-1 text-xs sm:text-sm text-white/80">
                <span className="break-all">{user?.email ?? "No email on file"}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <div className="flex flex-wrap flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="border-white/15 bg-white/5 text-white text-xs">
                    {user?.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm">
                    Member since {formatSince(user?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Profile completeness card - responsive */}
        <div className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="text-white/80 font-medium">Profile completeness</span>
            <span className={`font-semibold ${completenessToneClassName} text-sm sm:text-base`}>
              {profileCompleteness}%
            </span>
          </div>

          <Progress
            value={profileCompleteness}
            className="h-1.5 sm:h-2 bg-white/10 [&>div]:transition-all [&>div]:duration-500"
          />

          <p className={`text-[11px] sm:text-xs leading-4 sm:leading-5 mt-2 sm:mt-3 ${completenessToneClassName}`}>
            {completenessSummary}: {completenessDescription}
          </p>

          <Button
            type="button"
            className="mt-3 sm:mt-4 h-9 sm:h-10 w-full justify-between bg-white text-neutral-950 transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            onClick={onEditProfile}
          >
            Edit profile
            <BadgeCheck className="size-3.5 sm:size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </section>
  )
}