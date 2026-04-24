import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  TrendingUp,
  Briefcase,
} from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"

type PaymentFormValues = {
  amount: string
  date: string
  note: string
}

type ProjectPaymentFormProps = React.ComponentProps<"div"> & {
  projectId: string
  projectName?: string
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}

const getTodayDate = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().split("T")[0]
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
  return "Unable to process payment. Please try again."
}

function ProjectPaymentForm({
  className,
  projectId,
  projectName,
  onSuccess,
  onCancel,
  submitLabel = "Record Payment",
  cancelLabel = "Cancel",
  showCancel = false,
  ...props
}: ProjectPaymentFormProps) {
  const [estimatedTimeComplete, setEstimatedTimeComplete] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PaymentFormValues>({
    defaultValues: {
      amount: "",
      date: getTodayDate(),
      note: "",
    },
    mode: "onChange",
  })

  const watchAmount = watch("amount")

  // Calculate estimated completion time based on payment
  useEffect(() => {
    const fetchProjectBudget = async () => {
      try {
        const response = await axiosInstance.get(`/projects/${projectId}`)
        const project = response.data.data
        if (project && project.budget && watchAmount) {
          const amount = Number(watchAmount)
          if (!isNaN(amount) && amount > 0) {
            const percentage = (amount / project.budget) * 100
            setEstimatedTimeComplete(percentage)
          } else {
            setEstimatedTimeComplete(null)
          }
        }
      } catch (error) {
        console.error("Failed to fetch project details:", error)
      }
    }

    if (watchAmount) {
      fetchProjectBudget()
    }
  }, [watchAmount, projectId])

  const submitForm = async (values: PaymentFormValues) => {
    const normalizedValues: PaymentFormValues = {
      ...values,
      amount: values.amount.trim(),
      note: values.note.trim(),
    }

    const payload = {
      amount: Number(normalizedValues.amount),
      date: normalizedValues.date,
      note: normalizedValues.note || undefined,
    }

    const loadingToast = toast.loading("Recording payment...")

    try {
      await axiosInstance.post(`/projects/${projectId}/payments`, payload)

      toast.dismiss(loadingToast)
      toast.success("Payment recorded successfully", {
        icon: "💰",
        duration: 4000,
      })

      reset({
        amount: "",
        date: getTodayDate(),
        note: "",
      })
      onSuccess?.()
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="border-border/60">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Record Payment
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            <FieldGroup>
              {/* Project Info */}
              {projectName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="rounded-lg bg-muted/50 border border-border/40 p-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Recording payment for: <span className="font-semibold text-foreground">{projectName}</span></span>
                  </div>
                </motion.div>
              )}

              {/* Amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Field>
                  <FieldLabel htmlFor="payment-amount" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Amount Received
                  </FieldLabel>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="5000.00"
                    aria-invalid={!!errors.amount}
                    autoFocus
                    {...register("amount", {
                      required: "Payment amount is required.",
                      validate: (value) => {
                        const numericValue = Number(value)
                        if (isNaN(numericValue)) return "Amount must be a valid number."
                        if (numericValue <= 0) return "Amount must be greater than 0."
                        return true
                      },
                    })}
                  />
                  <FieldError>{errors.amount?.message}</FieldError>
                </Field>
              </motion.div>

              {/* Estimated Completion */}
              {estimatedTimeComplete !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                  className="rounded-lg bg-primary/10 border border-primary/20 p-3"
                >
                  <div className="text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Payment Progress</span>
                      <span className="text-sm font-semibold text-primary">
                        {Math.min(estimatedTimeComplete, 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(estimatedTimeComplete, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Date */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Field>
                  <FieldLabel htmlFor="payment-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Payment Date
                  </FieldLabel>
                  <Input
                    id="payment-date"
                    type="date"
                    {...register("date")}
                  />
                </Field>
              </motion.div>

              {/* Note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.25 }}
              >
                <Field>
                  <FieldLabel htmlFor="payment-note" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Payment Note
                  </FieldLabel>
                  <Textarea
                    id="payment-note"
                    placeholder="e.g., Client paid via bank transfer, Partial payment received"
                    {...register("note")}
                  />
                  <FieldDescription>
                    Add payment method or other relevant details (optional).
                  </FieldDescription>
                </Field>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                className="flex gap-3 pt-2"
              >
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSubmitting ? "Recording..." : submitLabel}
                </Button>
                {showCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={onCancel}
                  >
                    {cancelLabel}
                  </Button>
                )}
              </motion.div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectPaymentForm
