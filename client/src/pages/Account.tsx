import { lazy, Suspense, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"

import { updateAvatar } from "@/api/auth/login"
import { AccountHero } from "@/features/account/ui/AccountHero"
import { AccountOverview } from "@/features/account/ui/AccountOverview"
import { login as setAuth } from "@/store/features/authSlice"
import { writeAuthStorage } from "@/store/authStorage"
import type { RootState } from "@/store/store"

const ProfileEditorDialog = lazy(() => import("@/features/account/ui/ProfileEditorDialog").then((module) => ({ default: module.ProfileEditorDialog })))

type CompletenessFeedback = {
  toneClassName: string
  summary: string
  description: string
}

function getCompletenessFeedback(score: number, missingItems: string[]): CompletenessFeedback {
  if (score >= 90) {
    return {
      toneClassName: "text-emerald-300",
      summary: "Excellent",
      description: "Your profile is complete and polished.",
    }
  }

  if (score >= 70) {
    return {
      toneClassName: "text-sky-300",
      summary: "Strong",
      description: missingItems.length
        ? `Almost done. Add ${missingItems.join(", ")} to complete your profile.`
        : "Almost done. Add the remaining details to complete your profile.",
    }
  }

  if (score >= 50) {
    return {
      toneClassName: "text-amber-300",
      summary: "Needs improvement",
      description: missingItems.length
        ? `Missing: ${missingItems.join(", ")}. Fill these to improve account quality.`
        : "Complete more profile details to improve account quality.",
    }
  }

  return {
    toneClassName: "text-rose-300",
    summary: "Incomplete",
    description: missingItems.length
      ? `Critical details are missing: ${missingItems.join(", ")}.`
      : "Critical details are missing from your profile.",
  }
}

const Account = () => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)

  const initials = useMemo(() => {
    const parts = user?.name?.split(" ").filter(Boolean) ?? []
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "S"
  }, [user?.name])

  const completenessData = useMemo(() => {
    const checks = [
      { label: "full name", done: Boolean(user?.name?.trim()) },
      { label: "email", done: Boolean(user?.email?.trim()) },
      { label: "profile photo", done: Boolean(user?.avatar) },
      { label: "role", done: Boolean(user?.role) },
      { label: "account status", done: typeof user?.isActive === "boolean" },
      { label: "joined date", done: Boolean(user?.createdAt) },
      { label: "last login", done: Boolean(user?.lastLogin) },
    ]

    const totalChecks = checks.length
    const completedChecks = checks.filter((check) => check.done).length
    const score = Math.round((completedChecks / totalChecks) * 100)
    const missingItems = checks.filter((check) => !check.done).map((check) => check.label)
    const feedback = getCompletenessFeedback(score, missingItems)

    return {
      score,
      feedback,
    }
  }, [user])

  const handleRemoveAvatar = async () => {
    if (!user?.avatar || isRemovingAvatar) {
      return
    }

    setIsRemovingAvatar(true)

    try {
      const response = await updateAvatar(null)
      const nextUser = {
        ...(user ?? {}),
        ...response.user,
      }

      dispatch(setAuth({ user: nextUser }))
      writeAuthStorage({ user: nextUser })
      toast.success("Profile image removed.")
    } catch {
      toast.error("Unable to remove profile image.")
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-4">
      <AccountHero
        user={user}
        initials={initials}
        profileCompleteness={completenessData.score}
        completenessSummary={completenessData.feedback.summary}
        completenessDescription={completenessData.feedback.description}
        completenessToneClassName={completenessData.feedback.toneClassName}
        isRemovingAvatar={isRemovingAvatar}
        onEditProfile={() => setIsEditorOpen(true)}
        onRemoveAvatar={handleRemoveAvatar}
      />

      <AccountOverview
        user={user}
        profileCompleteness={completenessData.score}
        onEditProfile={() => setIsEditorOpen(true)}
      />

      <Suspense fallback={null}>
        <ProfileEditorDialog
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          user={user}
          initials={initials}
        />
      </Suspense>
    </div>
  )
}

export default Account
