import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group"
import { Eye, EyeClosed } from "lucide-react"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { login as loginRequest, register as registerRequest } from "@/api/auth/login"
import { login as setAuth } from "@/store/features/authSlice"
import { clearAuthStorage, writeAuthStorage } from "@/store/authStorage"
import type { RootState } from "@/store/store"

type AuthMode = "login" | "signup"

type AuthFormProps = React.ComponentProps<"div"> & {
  mode?: AuthMode
}

export function AuthForm({ mode = "signup", className, ...props }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const isSignup = mode === "signup"

  const title = isSignup ? "Create your account" : "Welcome back"
  const description = isSignup
    ? "Enter your details below to get started with Solodesk"
    : "Use your credentials to access your workspace"
  const submitLabel = isSignup ? "Create Account" : "Sign In"
  const footerPrompt = isSignup ? "Already have an account?" : "Need an account?"
  const footerAction = isSignup ? "Sign in" : "Sign up"
  const footerHref = isSignup ? "/auth/login" : "/auth/signup"

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response
      if (response?.data?.message) {
        return response.data.message
      }
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    return "Unable to complete authentication."
  }

  const getPasswordRequirements = () =>
    "Must be at least 8 characters and include uppercase, lowercase, and a number."

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    if (!email.trim()) {
      setErrorMessage("Email is required.")
      return
    }

    if (!password) {
      setErrorMessage("Password is required.")
      return
    }

    if (isSignup && !fullName.trim()) {
      setErrorMessage("Full name is required.")
      return
    }

    if (isSignup && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    if (isSignup) {
      const hasMinLength = password.length >= 8
      const hasUppercase = /[A-Z]/.test(password)
      const hasLowercase = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)

      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
        setErrorMessage(getPasswordRequirements())
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = isSignup
        ? await registerRequest(fullName.trim(), email.trim(), password)
        : await loginRequest(email.trim(), password)

      dispatch(setAuth({ user: response.user }))
      writeAuthStorage({ user: response.user })
      toast.success(isSignup ? "Account created successfully." : "Signed in successfully.")
    } catch (error) {
      const message = getErrorMessage(error)
      setErrorMessage(message)
      clearAuthStorage()
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border border-border/50 bg-card/95 p-0 shadow-xl backdrop-blur-sm">
        <CardContent className="p-0">
          <form className="space-y-5 bg-linear-to-br from-background to-muted/5 p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="mb-2 flex flex-col items-center gap-3 text-center">
                <h1 className="bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent from-foreground to-foreground/80">
                  {title}
                </h1>
                <p className="text-sm text-balance leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              {isSignup && (
                <Field>
                  <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                  <FieldDescription>
                    Will be displayed on your profile and in your account settings.
                  </FieldDescription>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldDescription>
                  {isSignup
                    ? "We’ll use this to contact you and sign in to your account."
                    : "Use the email address associated with your workspace."}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <InputGroupAddon align="inline-end" />
                  <InputGroupButton
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                    className="transition-colors hover:text-primary"
                  >
                    {!showPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
                  </InputGroupButton>
                </InputGroup>
                <FieldDescription>
                  {isSignup ? getPasswordRequirements() : "Use the password tied to your account."}
                </FieldDescription>
              </Field>

              {isSignup && (
                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <InputGroupAddon align="inline-end" />
                    <InputGroupButton
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      type="button"
                      className="transition-colors hover:text-primary"
                    >
                      {!showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
                    </InputGroupButton>
                  </InputGroup>
                </Field>
              )}

              {errorMessage ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              ) : null}

              <Field>
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  className="w-full font-semibold shadow-md transition-shadow hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Please wait..." : submitLabel}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {footerPrompt}{" "}
                <Link to={footerHref} className="font-medium text-primary hover:underline">
                  {footerAction}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function SignupForm(props: React.ComponentProps<"div">) {
  return <AuthForm mode="signup" {...props} />
}

export function LoginForm(props: React.ComponentProps<"div">) {
  return <AuthForm mode="login" {...props} />
}