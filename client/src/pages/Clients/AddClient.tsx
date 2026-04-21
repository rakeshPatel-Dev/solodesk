
import { useNavigate } from "react-router-dom"

import ClientForm from "@/components/forms/ClientForm"

const AddClient = () => {
  const navigate = useNavigate()

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Add Client</h1>
        <p className="text-sm text-muted-foreground">Create a client profile to track projects and billing activity.</p>
      </div>

      <ClientForm
        onSubmit={async (values) => {
          // Let the form perform its own API submission and only navigate afterward.
          await Promise.resolve(values)
          navigate("/clients")
        }}
      />
    </section>
  )
}

export default AddClient
