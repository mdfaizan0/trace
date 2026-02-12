import api from "./axios"

/**
 * Upload a document with progress tracking
 * @param {FormData} formData - Should contain 'file' and 'title'
 * @param {Function} onUploadProgress - Axios progress event callback
 */
export const uploadDocument = async (formData, onUploadProgress) => {
    return api.post("/api/documents", formData, {
        onUploadProgress
    })
}
