import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { ThemeProvider } from './components/sidebar/theme-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SidebarProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster position='top-right' />
          <App />
        </TooltipProvider>
      </BrowserRouter>
    </SidebarProvider>
  </ThemeProvider>
)
