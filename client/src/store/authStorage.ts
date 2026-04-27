export type AuthUser = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  isActive: boolean
  avatar?: string | null
  lastLogin?: string | null
  createdAt?: string
  updatedAt?: string
}

export type StoredAuthState = {
  user: AuthUser
}

export const AUTH_STORAGE_KEY = "solodesk-auth"

export function readAuthStorage() {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredAuthState
  } catch {
    return null
  }
}

export function writeAuthStorage(state: StoredAuthState) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
}

export function clearAuthStorage() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}