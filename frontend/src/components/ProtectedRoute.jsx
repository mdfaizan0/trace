import { Navigate, Outlet } from "react-router-dom"

/**
 * Lightweight Route Protection Component (Layout Version)
 * Checks for the presence of "trace_token" in localStorage.
 * Redirects to /login if token is missing.
 * Renders nested routes via <Outlet /> if token is present.
 */
function ProtectedRoute() {
    const token = localStorage.getItem("trace_token")

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
