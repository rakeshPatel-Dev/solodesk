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
import { useState } from "react"
import { Link } from "react-router-dom"

type AuthMode = "login" | "signup"

type AuthFormProps = React.ComponentProps<"div"> & {
  mode?: AuthMode
}

export function AuthForm({ mode = "signup", className, ...props }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const isSignup = mode === "signup"

  const title = isSignup ? "Create your account" : "Welcome back"
  const description = isSignup
    ? "Enter your details below to get started with Solodesk"
    : "Use your credentials to access your workspace"
  const submitLabel = isSignup ? "Create Account" : "Sign In"
  const footerPrompt = isSignup ? "Already have an account?" : "Need an account?"
  const footerAction = isSignup ? "Sign in" : "Sign up"
  const footerHref = isSignup ? "/auth/login" : "/auth/signup"

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border border-border/50 bg-card/95 p-0 shadow-xl backdrop-blur-sm">
        <CardContent className="p-0">
          <form className="space-y-5 p-6 md:p-8 bg-linear-to-br from-background to-muted/5">
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
                  <Input id="full-name" type="text" placeholder="John Doe" autoComplete="name" required />
                  <FieldDescription>
                    Will be displayed on your profile and in your account settings.
                  </FieldDescription>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" autoComplete="email" required />
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete={isSignup ? "new-password" : "current-password"}
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
                  {isSignup ? "Must be at least 8 characters long." : "Use the password tied to your account."}
                </FieldDescription>
              </Field>

              {isSignup && (
                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

              <Field>
                <Button variant="default" size="lg" type="submit" className="w-full font-semibold shadow-md transition-shadow hover:shadow-lg">
                  {submitLabel}
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