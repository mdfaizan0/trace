import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"

// Layouts
import App from "./App"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardLayout from "./layouts/DashboardLayout"
import Loading from "./components/Loading"

// Pages (Lazy Loaded)
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const DocumentDetails = lazy(() => import("./pages/DocumentDetails"))
const SignInternal = lazy(() => import("./pages/SignInternal"))
const Documents = lazy(() => import("./pages/Documents"))
const NotFound = lazy(() => import("./pages/NotFound"))

/**
 * Scalable Routing Topology
 * 
 * Root (App.jsx)
 *  ├── Public Routes (Login, Register)
 *  └── Protected Routes (Wrapped in ProtectedRoute layout)
 *       └── Dashboard Layout
 *            └── Dashboard Page
 */
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Public Routes
            {
                index: true,
                element: <Home />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },

            // Protected Routes
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: "dashboard",
                                element: <Dashboard />,
                            },
                            // Add more dashboard sub-pages here
                            {
                                path: "dashboard/documents/:id",
                                element: <DocumentDetails />,
                            },
                            {
                                path: "dashboard/documents/:id/sign",
                                element: <SignInternal />,
                            },
                            {
                                path: "documents",
                                element: <Documents />,
                            },
                        ],
                    },
                ],
            },

            // 404 Fallback
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
])

export default router
