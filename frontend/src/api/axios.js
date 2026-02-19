import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("trace_token")
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"]
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to normalize errors
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        const normalizedError = {
            message: "An unexpected error occurred",
            status: error.response?.status || 500,
            data: error.response?.data,
        }

        if (normalizedError.status === 401) {
            localStorage.removeItem("trace_token")
            localStorage.removeItem("trace_user")

            // Only redirect if we're not already on the login or register page
            const publicPaths = ["/login", "/register", "/"]
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = "/login"
            }
        }

        if (error.response?.data?.message) {
            normalizedError.message = error.response.data.message
        } else if (error.message) {
            normalizedError.message = error.message
        }

        return Promise.reject(normalizedError)
    }
)

export default api
