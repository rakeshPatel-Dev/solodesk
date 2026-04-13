import React from 'react'
import { AppSidebar } from './components/app-sidebar'
import { SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

const App = () => {
  const location = useLocation()
  const pageTitle = location.pathname === '/settings' ? 'Settings' : 'Dashboard'

  return (
    <div className="flex min-h-svh w-full">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
          <h1 className="ml-3 text-sm font-medium">{pageTitle}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </SidebarInset>
    </div>
  )
}

export default App
