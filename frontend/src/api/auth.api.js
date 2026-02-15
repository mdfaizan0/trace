import api from "./axios"

export const signup = async (payload) => {
    return api.post("/api/auth/signup", payload)
}

export const signin = async (payload) => {
    return api.post("/api/auth/signin", payload)
}

export const getMyProfile = async () => {
    return api.get("/api/auth/me")
}

export const logout = (navigate) => {
    localStorage.removeItem("trace_token")
    localStorage.removeItem("trace_user")
    navigate("/login")
}