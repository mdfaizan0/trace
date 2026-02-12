import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Loading from "./components/Loading"

/**
 * Root Application Shell
 * Acts as the top-level layout providing Suspense for lazy-loaded routes.
 */
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  )
}

export default App