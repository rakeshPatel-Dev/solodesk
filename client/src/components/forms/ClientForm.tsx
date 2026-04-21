import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Mail, Phone, MapPin, FileText, BadgeCheck, Loader2 } from "lucide-react"

import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type ClientStatus = "Active" | "Inactive"

type ClientFormValues = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
  status: ClientStatus
}

type ClientFormProps = React.ComponentProps<"div"> & {
  onSubmit?: (values: ClientFormValues) => Promise<void> | void
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  initialValues?: Partial<ClientFormValues>
  clientId?: string
  showCancel?: boolean
  compact?: boolean
}

const defaultInitialValues: ClientFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  status: "Active",
}

const statusConfig = {
  Active: { label: "Active", variant: "success" as const, icon: BadgeCheck },
  Inactive: { label: "Inactive", variant: "secondary" as const, icon: null },
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("response" in error) {
      const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response
      if (response?.data?.message) return response.data.message
      if (response?.data?.errors) {
        const firstError = Object.values(response.data.errors)[0]
        if (firstError && firstError[0]) return firstError[0]
      }
    }
    if (error instanceof Error && error.message) return error.message
  }
  return "Unable to process request. Please try again."
}

function ClientForm({
  className,
  onSubmit,
  onSuccess,
  onCancel,
  submitLabel = "Add Client",
  cancelLabel = "Cancel",
  initialValues,
  clientId,
  showCancel = false,
  compact = false,
  ...props
}: ClientFormProps) {
  const isEditMode = !!clientId

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch,
  } = useForm<ClientFormValues>({
    defaultValues: { ...defaultInitialValues, ...initialValues },
    mode: "onChange",
  })

  const watchedStatus = watch("status")

  // Reset form when initialValues change (e.g., editing different client)
  useEffect(() => {
    if (initialValues) {
      reset({ ...defaultInitialValues, ...initialValues })
    }
  }, [initialValues, reset])

  const submitForm = async (values: ClientFormValues) => {
    const normalizedValues: ClientFormValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      notes: values.notes.trim(),
    }

    const loadingToast = toast.loading(
      isEditMode ? "Updating client..." : "Creating client..."
    )

    try {
      if (onSubmit) {
        await onSubmit(normalizedValues)
      } else if (isEditMode && clientId) {
        await axiosInstance.put(`/clients/${clientId}`, normalizedValues)
      } else {
        await axiosInstance.post("/clients", normalizedValues)
      }

      toast.dismiss(loadingToast)
      toast.success(isEditMode ? "Client updated successfully" : "Client created successfully", {
        icon: "🎉",
        duration: 4000,
      })

      if (!isEditMode) {
        reset(defaultInitialValues)
      }
      onSuccess?.()
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(getErrorMessage(error), {
        duration: 5000,
      })
    }
  }

  const handleCancel = () => {
    reset({ ...defaultInitialValues, ...initialValues })
    onCancel?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("w-full p-8", className)}
      {...props}
    >
      <Card className={cn(
        "border-border/60 shadow-sm hover:shadow-md transition-all duration-200",
        compact && "shadow-none"
      )}>
        <CardHeader className={cn(compact && "pb-3")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              {isEditMode ? "Edit Client" : "New Client"}
            </CardTitle>
            {isEditMode && watchedStatus && (
              <Badge variant={statusConfig[watchedStatus].variant}>
                {statusConfig[watchedStatus].label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(compact && "pt-0")}>
          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            <FieldGroup className={cn(compact && "gap-4")}>
              {/* Name Field - Required */}
              <Field>
                <FieldLabel htmlFor="client-name" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Client Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="client-name"
                  placeholder="e.g., Acme Corporation"
                  aria-invalid={!!errors.name}
                  disabled={isSubmitting}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                  {...register("name", {
                    required: "Client name is required",
                    minLength: { value: 2, message: "Must be at least 2 characters" },
                    maxLength: { value: 100, message: "Cannot exceed 100 characters" },
                  })}
                />
                <AnimatePresence mode="wait">
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FieldError>{errors.name.message}</FieldError>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Email Field - Optional with validation */}
              <Field>
                <FieldLabel htmlFor="client-email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </FieldLabel>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="team@acme.com"
                  aria-invalid={!!errors.email}
                  disabled={isSubmitting}
                  className="transition-all"
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                <FieldDescription>
                  Used for invoices and communications
                </FieldDescription>
                <AnimatePresence mode="wait">
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FieldError>{errors.email.message}</FieldError>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Phone Field */}
              <Field>
                <FieldLabel htmlFor="client-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number
                </FieldLabel>
                <Input
                  id="client-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  disabled={isSubmitting}
                  {...register("phone")}
                />
              </Field>

              {/* Address Field */}
              <Field>
                <FieldLabel htmlFor="client-address" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Address
                </FieldLabel>
                <Input
                  id="client-address"
                  placeholder="Street, city, postal code, country"
                  aria-invalid={!!errors.address}
                  disabled={isSubmitting}
                  {...register("address", {
                    maxLength: { value: 200, message: "Cannot exceed 200 characters" },
                  })}
                />
                <AnimatePresence mode="wait">
                  {errors.address && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FieldError>{errors.address.message}</FieldError>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Status Field */}
              <Field>
                <FieldLabel htmlFor="client-status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                      <SelectTrigger id="client-status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="Inactive">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Notes Field */}
              <Field>
                <FieldLabel htmlFor="client-notes" className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Notes
                </FieldLabel>
                <Textarea
                  id="client-notes"
                  placeholder="Add any relevant information about this client..."
                  rows={4}
                  aria-invalid={!!errors.notes}
                  disabled={isSubmitting}
                  className="resize-none"
                  {...register("notes", {
                    maxLength: { value: 500, message: "Cannot exceed 500 characters" },
                  })}
                />
                <FieldDescription className="flex justify-between">
                  <span>Internal notes for your team</span>
                  {watch("notes")?.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {watch("notes").length}/500
                    </span>
                  )}
                </FieldDescription>
                <AnimatePresence mode="wait">
                  {errors.notes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FieldError>{errors.notes.message}</FieldError>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Actions */}
              <div className={cn(
                "flex gap-3 pt-4",
                compact ? "flex-col" : "flex-col sm:flex-row"
              )}>
                <Button
                  type="submit"
                  disabled={isSubmitting || (isEditMode ? !isDirty : !isValid)}
                  className={cn(
                    "relative transition-all",
                    !compact && "sm:flex-1"
                  )}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting
                    ? (isEditMode ? "Updating..." : "Creating...")
                    : submitLabel
                  }
                </Button>

                {(showCancel || onCancel) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className={cn(!compact && "sm:flex-1")}
                  >
                    {cancelLabel}
                  </Button>
                )}
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ClientForm