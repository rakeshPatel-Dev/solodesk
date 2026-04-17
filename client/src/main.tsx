import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { ThemeProvider } from './components/sidebar/theme-provider.tsx'
import store from './store/store.ts'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
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
  </Provider>
)
