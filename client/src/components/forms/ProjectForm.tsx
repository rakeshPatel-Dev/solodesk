import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import axiosInstance from "@/lib/axios"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

type ProjectStatus = "Lead" | "In Progress" | "Completed"

type ProjectFormValues = {
  name: string
  description: string
  clientId: string
  type: string
  budget: string
  status: ProjectStatus
  startDate: string
  deadline: string
}

type ClientOption = {
  _id: string
  name: string
}

type ClientListResponse = {
  success: boolean
  data: ClientOption[]
}

type ProjectFormProps = React.ComponentProps<"div"> & {
  onSubmit?: (values: {
    name: string
    description: string
    clientId: string
    type: string
    budget?: number
    status: ProjectStatus
    startDate?: string
    deadline?: string
  }) => Promise<void> | void
  onSuccess?: () => void
  submitLabel?: string
}

const getDateInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().split("T")[0]
}

const getTodayDate = () => getDateInputValue(new Date())

const getDeadlineOptions = (baseDate: string) => {
  const start = baseDate ? new Date(`${baseDate}T00:00:00`) : new Date()

  return [1, 2, 3, 4, 5].map((days) => {
    const nextDate = new Date(start)
    nextDate.setDate(start.getDate() + days)

    return {
      value: getDateInputValue(nextDate),
      label: days === 1 ? "Tomorrow" : `${days} days later`,
    }
  })
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

  return "Unable to create project."
}

function ProjectForm({ className, onSubmit, onSuccess, submitLabel = "Add Project", ...props }: ProjectFormProps) {
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clients, setClients] = useState<ClientOption[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      type: "",
      budget: "",
      status: "Lead",
      startDate: getTodayDate(),
      deadline: "",
    },
    mode: "onBlur",
  })

  const startDate = watch("startDate")
  const deadlineOptions = useMemo(() => getDeadlineOptions(startDate), [startDate])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get<ClientListResponse>("/clients", {
          params: { page: 1, limit: 100, sortBy: "name", sortOrder: "asc" },
        })
        setClients(response.data.data ?? [])
      } catch {
        toast.error("Unable to load clients for project assignment.")
      } finally {
        setIsLoadingClients(false)
      }
    }

    fetchClients()
  }, [])

  const submitForm = async (values: ProjectFormValues) => {
    const normalizedValues: ProjectFormValues = {
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      type: values.type.trim(),
      budget: values.budget.trim(),
    }

    const payload = {
      name: normalizedValues.name,
      description: normalizedValues.description,
      clientId: normalizedValues.clientId,
      type: normalizedValues.type,
      status: normalizedValues.status,
      budget: normalizedValues.budget ? Number(normalizedValues.budget) : undefined,
      startDate: normalizedValues.startDate || undefined,
      deadline: normalizedValues.deadline || undefined,
    }

    try {
      if (onSubmit) {
        await onSubmit(payload)
      } else {
        await axiosInstance.post("/projects", payload)
      }

      toast.success("Project created successfully.")
      reset({
        name: "",
        description: "",
        clientId: "",
        type: "",
        budget: "",
        status: "Lead",
        startDate: getTodayDate(),
        deadline: "",
      })
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Add Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="project-name">Project Name</FieldLabel>
                <Input
                  id="project-name"
                  placeholder="Website Redesign"
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    required: "Project name is required.",
                    validate: (value) => value.trim().length >= 2 || "Project name must be at least 2 characters.",
                  })}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="project-client">Client</FieldLabel>
                <Controller
                  control={control}
                  name="clientId"
                  rules={{ required: "Please select a client." }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingClients}>
                      <SelectTrigger id="project-client" className="w-full" aria-invalid={!!errors.clientId}>
                        <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{errors.clientId?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="project-type">Project Type</FieldLabel>
                <Input
                  id="project-type"
                  placeholder="Design, Development, Marketing"
                  {...register("type")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="project-status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="project-status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="project-budget">Budget</FieldLabel>
                <Input
                  id="project-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  aria-invalid={!!errors.budget}
                  {...register("budget", {
                    validate: (value) => {
                      if (!value.trim()) return true
                      const numericValue = Number(value)
                      if (Number.isNaN(numericValue)) return "Budget must be a valid number."
                      if (numericValue < 0) return "Budget cannot be negative."
                      return true
                    },
                  })}
                />
                <FieldError>{errors.budget?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="project-start-date">Start Date</FieldLabel>
                <Input
                  id="project-start-date"
                  type="date"
                  {...register("startDate")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="project-deadline">Deadline</FieldLabel>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {deadlineOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setValue("deadline", option.value)}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                  <Controller
                    control={control}
                    name="deadline"
                    rules={{
                      validate: (value) => {
                        if (!value || !startDate) return true
                        const start = new Date(`${startDate}T00:00:00`)
                        const end = new Date(`${value}T00:00:00`)
                        return end >= start || "Deadline must be after the start date."
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        id="project-deadline"
                        type="date"
                        aria-invalid={!!errors.deadline}
                        {...field}
                      />
                    )}
                  />
                </div>
                <FieldDescription>
                  Click a quick option or select a custom date.
                </FieldDescription>
                <FieldError>{errors.deadline?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="project-description">Description</FieldLabel>
                <Textarea
                  id="project-description"
                  placeholder="Project overview, goals, and scope"
                  aria-invalid={!!errors.description}
                  {...register("description", {
                    validate: (value) => value.length <= 1000 || "Description cannot exceed 1000 characters.",
                  })}
                />
                <FieldDescription>
                  Include important delivery details your team should know.
                </FieldDescription>
                <FieldError>{errors.description?.message}</FieldError>
              </Field>

              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isLoadingClients}>
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectForm
