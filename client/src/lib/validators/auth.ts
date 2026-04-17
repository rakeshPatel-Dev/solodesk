export type AuthMode = "login" | "signup"

export type AuthFormData = {
  mode: AuthMode
  fullName?: string
  email: string
  password: string
  confirmPassword?: string
}

export type AuthFormErrors = Partial<{
  fullName: string
  email: string
  password: string
  confirmPassword: string
}>

export type AuthValidationResult = {
  valid: boolean
  errors: AuthFormErrors
  message: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordRequirements =
  "Must be at least 8 characters and include uppercase, lowercase, and a number."

export function validateAuthFormData(data: AuthFormData): AuthValidationResult {
  const errors: AuthFormErrors = {}

  if (!data.email.trim()) {
    errors.email = "Email is required."
  } else if (!emailPattern.test(data.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!data.password) {
    errors.password = "Password is required."
  }

  if (data.mode === "signup") {
    if (!data.fullName?.trim()) {
      errors.fullName = "Full name is required."
    }

    const hasMinLength = data.password.length >= 8
    const hasUppercase = /[A-Z]/.test(data.password)
    const hasLowercase = /[a-z]/.test(data.password)
    const hasNumber = /[0-9]/.test(data.password)

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      errors.password = passwordRequirements
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match."
    }
  }

  const firstError = errors.fullName ?? errors.email ?? errors.password ?? errors.confirmPassword ?? ""

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    message: firstError,
  }
}

export function getAuthPasswordRequirements() {
  return passwordRequirements
}