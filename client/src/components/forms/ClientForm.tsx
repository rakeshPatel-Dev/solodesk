import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

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
  submitLabel?: string
}

const initialValues: ClientFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  status: "Active",
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

  return "Unable to create client."
}

function ClientForm({ className, onSubmit, onSuccess, submitLabel = "Add Client", ...props }: ClientFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    defaultValues: initialValues,
    mode: "onBlur",
  })

  const submitForm = async (values: ClientFormValues) => {
    const normalizedValues: ClientFormValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      notes: values.notes.trim(),
    }

    try {
      if (onSubmit) {
        await onSubmit(normalizedValues)
      } else {
        await axiosInstance.post("/clients", normalizedValues)
      }

      toast.success("Client created successfully.")
      reset(initialValues)
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Add Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="client-name">Client Name</FieldLabel>
                <Input
                  id="client-name"
                  placeholder="Acme Corporation"
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    required: "Client name is required.",
                    validate: (value) => value.trim().length >= 2 || "Client name must be at least 2 characters.",
                  })}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="client-email">Email</FieldLabel>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="team@acme.com"
                  aria-invalid={!!errors.email}
                  {...register("email", {
                    validate: (value) => {
                      if (!value.trim()) return true
                      return /^\S+@\S+\.\S+$/.test(value.trim()) || "Enter a valid email address."
                    },
                  })}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="client-phone">Phone</FieldLabel>
                <Input
                  id="client-phone"
                  placeholder="+1 555 0101"
                  {...register("phone")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="client-address">Address</FieldLabel>
                <Input
                  id="client-address"
                  placeholder="Street, city, country"
                  aria-invalid={!!errors.address}
                  {...register("address", {
                    validate: (value) => value.length <= 200 || "Address cannot exceed 200 characters.",
                  })}
                />
                <FieldError>{errors.address?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="client-status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="client-status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="client-notes">Notes</FieldLabel>
                <Textarea
                  id="client-notes"
                  placeholder="Any additional details about this client"
                  aria-invalid={!!errors.notes}
                  {...register("notes", {
                    validate: (value) => value.length <= 1000 || "Notes cannot exceed 1000 characters.",
                  })}
                />
                <FieldDescription>
                  Keep notes concise and useful for your team.
                </FieldDescription>
                <FieldError>{errors.notes?.message}</FieldError>
              </Field>

              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientForm
