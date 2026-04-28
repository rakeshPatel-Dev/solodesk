import { AppSidebar } from './components/layout/app-sidebar'
import { SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Clients from './pages/clients/Clients'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Payments from './pages/payments/Payments'
import AddPayment from './pages/payments/AddPayment'
import Tasks from './pages/tasks/Tasks'
import AddTask from './pages/tasks/AddTask'
import Footer from './components/layout/Footer'
import Date from './components/shared/Date'
import LoginPage from './pages/auth/login'
import SignupPage from './pages/auth/Signup'
import Account from './pages/Account'
import Notifications from './pages/Notifications.tsx'
import { getMe } from './api/auth/login'
import { login as setAuth, logout as clearAuth } from './store/features/authSlice'
import { clearAuthStorage, writeAuthStorage } from './store/authStorage'
import type { RootState } from './store/store'
import { Loader2Icon } from 'lucide-react'
import HelpCenterPage from './pages/HelpCenter.tsx'

const App = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const isAuthRoute = location.pathname.startsWith('/auth')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await getMe()
        if (response?.user) {
          dispatch(setAuth({ user: response.user }))
          writeAuthStorage({ user: response.user })
        } else {
          clearAuthStorage()
          dispatch(clearAuth())
        }
      } catch {
        clearAuthStorage()
        dispatch(clearAuth())
      } finally {
        setAuthChecked(true)
      }
    }

    void validateSession()
  }, [dispatch])

  if (!authChecked) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-5 py-4 shadow-lg backdrop-blur-sm">
          <Loader2Icon className="size-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Checking your session...</span>
        </div>
      </div>
    )
  }

  if (isAuthRoute) {
    return (
      <div className="flex min-h-svh w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
              <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              <Route path="/auth/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

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
              <Route path='new' element={<Navigate to="/clients" replace />} />
            </Route>
            <Route path="/projects" >
              <Route index element={<Projects />} />
              <Route path='new' element={<Navigate to="/projects" replace />} />
              <Route path=':id' element={<ProjectDetail />} />
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
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth/signup" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Footer />
        </main>
      </SidebarInset>
    </div>
  )
}

export default App
