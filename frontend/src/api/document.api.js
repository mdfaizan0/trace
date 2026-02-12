import api from "./axios"

export const uploadDocument = async (formData) => {
    return api.post("/api/documents", formData)
}
