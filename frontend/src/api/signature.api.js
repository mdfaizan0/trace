import api from "./axios"

export const createInternalSignature = async (payload) => {
    return api.post("/api/signatures", payload)
}

export const finalizeInternalSignature = async (payload) => {
    return api.post("/api/signatures/sign", payload)
}

export const createPublicSignature = async (payload) => {
    return api.post("/api/signatures/public", payload)
}

export const getPublicSignature = async (token) => {
    return api.get(`/api/signatures/public/${token}`)
}

export const finalizePublicSignature = async (token, payload) => {
    // payload should include email and coordinates (x_percent, y_percent)
    return api.post(`/api/signatures/public/${token}/finalize`, payload)
}
