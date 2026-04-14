import React from 'react'
import { AppSidebar } from './components/layout/app-sidebar'
import { SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Clients from './pages/Clients/Clients'
import Projects from './pages/projects/Projects'
import Payments from './pages/payments/Payments'
import AddClient from './pages/Clients/AddClient'
import AddProject from './pages/projects/AddProject'
import AddPayment from './pages/payments/AddPayment'
import Tasks from './pages/tasks/Tasks'
import AddTask from './pages/tasks/AddTask'
import Reports from './pages/Reports'
import Footer from './components/layout/Footer'
import Date from './components/shared/Date'

const App = () => {
  const location = useLocation()
  const pageTitle = location.pathname === '/'
    ? 'Dashboard'
    : (() => {
      const segment = location.pathname.split('/').pop();
      return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : '';
    })();

  return (
    <div className="flex min-h-svh w-full">
      <AppSidebar />
      <SidebarInset>
        <header className=" h-14 items-center flex justify-between border-b px-4">
          <div className="flex items-center">
            <SidebarTrigger />
            <h1 className="ml-3 text-sm font-medium">{pageTitle}</h1>
          </div>
          <Date />
        </header>
        <main className="flex-1 p-4 md:p-6">

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" >
              <Route index element={<Clients />} />
              <Route path='new' element={<AddClient />} />
            </Route>
            <Route path="/projects" >
              <Route index element={<Projects />} />
              <Route path='new' element={<AddProject />} />
            </Route>
            <Route path="/payments">
              <Route index element={<Payments />} />
              <Route path="new" element={<AddPayment />} />
            </Route>
            <Route path="/tasks">
              <Route index element={<Tasks />} />
              <Route path="new" element={<AddTask />} />
            </Route>
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Footer />
        </main>
      </SidebarInset>
    </div>
  )
}

export default App
