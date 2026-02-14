import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Loading from "./components/Loading"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Root Application Shell
 * Acts as the top-level layout providing Suspense for lazy-loaded routes.
 */
function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </TooltipProvider>
  )
}

export default App