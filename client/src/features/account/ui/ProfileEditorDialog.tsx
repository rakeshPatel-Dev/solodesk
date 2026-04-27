import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"

import { updateProfile } from "@/api/auth/login"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login as setAuth } from "@/store/features/authSlice"
import { writeAuthStorage, type AuthUser } from "@/store/authStorage"

type ProfileEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser | null
  initials: string
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Unable to update profile."
}

export function ProfileEditorDialog({ open, onOpenChange, user, initials }: ProfileEditorDialogProps) {
  const dispatch = useDispatch()
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [imageValue, setImageValue] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFileLabel, setImageFileLabel] = useState("")

  const previewSource = useMemo(() => imagePreview || user?.avatar || undefined, [imagePreview, user?.avatar])

  useEffect(() => {
    if (!open || !user) return

    setName(user.name ?? "")
    setEmail(user.email ?? "")
    setImageValue(user.avatar ?? "")
    setImagePreview(user.avatar ?? null)
    setImageFileLabel("")
  }, [open, user])

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setImageValue(result)
      setImagePreview(result)
      setImageFileLabel(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageValue("")
    setImagePreview(null)
    setImageFileLabel("")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsSaving(true)

    try {
      const nextImage = imageValue.trim()

      const response = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        image: nextImage ? nextImage : null,
      })

      const nextUser = {
        ...(user ?? {}),
        ...response.user,
      }

      dispatch(setAuth({ user: nextUser }))
      writeAuthStorage({ user: nextUser })
      toast.success("Profile updated successfully.")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name, email, and profile image.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                disabled={isSaving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSaving}
                required
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 ring-2 ring-primary/10">
                <AvatarImage src={previewSource} alt={name || user?.name || "Profile image"} />
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile image</p>
                <p className="text-sm text-muted-foreground">Upload a file or paste an image URL.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image">Image URL</Label>
              <Input
                id="profile-image"
                type="url"
                value={imageValue}
                onChange={(event) => setImageValue(event.target.value)}
                placeholder="https://example.com/avatar.png"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image-file">Upload file</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  id="profile-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={isSaving}
                  className="file:mr-4 cursor-pointer  file:rounded-md file:border-0 file:text-xs file:font-medium file:text-primary hover:file:text-primary/80 transiall duration-300"
                />
                {imagePreview && (
                  <Button type="button" variant="outline" onClick={handleRemoveImage} disabled={isSaving}>
                    Clear
                  </Button>
                )}
              </div>
              {imageFileLabel && (
                <p className="text-xs text-muted-foreground">Selected: {imageFileLabel}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}