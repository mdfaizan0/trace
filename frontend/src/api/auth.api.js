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
