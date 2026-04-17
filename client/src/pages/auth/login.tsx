import { LoginForm } from "@/components/forms/authForm"
import { GeometricBackground } from "@/components/ui/shape-landing-hero"

export default function LoginPage() {

  return (
    <div className="relative  w-full min-h-svh overflow-hidden">
      <GeometricBackground />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 shadow-md transition-shadow hover:shadow-lg">
              <img className="p-2" src="/solodesk-logo.svg" alt="Solodesk logo" />
            </div>
            <h1 className="bg-linear-to-r bg-clip-text text-3xl font-black font-mono text-transparent from-foreground to-foreground/80">
              Solodesk
            </h1>
          </div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Welcome back to your workspace
          </p>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}