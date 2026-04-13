import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Dashboard = () => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the sidebar to navigate clients, projects, payments, tasks, reports, and settings.
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
