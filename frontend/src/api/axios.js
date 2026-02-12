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

        if (error.response?.data?.message) {
            normalizedError.message = error.response.data.message
        } else if (error.message) {
            normalizedError.message = error.message
        }

        return Promise.reject(normalizedError)
    }
)

export default api
