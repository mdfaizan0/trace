import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Loading from "./components/Loading"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "./components/ErrorBoundary"

/**
 * Root Application Shell
 * Acts as the top-level layout providing Suspense for lazy-loaded routes.
 */
function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={300}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
        <Toaster closeButton position="top-right" richColors />
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App