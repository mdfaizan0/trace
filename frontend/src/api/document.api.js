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

export const getAllDocuments = async () => {
    return api.get("/api/documents")
}

export const getDocumentById = async (id) => {
    return api.get(`/api/documents/${id}`)
}

export const getOriginalDocument = async (id) => {
    return api.get(`/api/documents/${id}/download/original?action=preview`, {
        responseType: "blob"
    })
}

export const getSignedDocument = async (id) => {
    return api.get(`/api/documents/${id}/download/signed?action=preview`, {
        responseType: "blob"
    })
}

export const downloadOriginalDocument = async (id) => {
    return api.get(`/api/documents/${id}/download/original`, {
        responseType: "blob"
    })
}

export const downloadSignedDocument = async (id) => {
    return api.get(`/api/documents/${id}/download/signed`, {
        responseType: "blob"
    })
}

/**
 * Trigger a browser file download from a Blob
 * @param {Blob} blob - The file blob
 * @param {string} filename - The download filename
 */
export const triggerBlobDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = filename
    window.document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
}

export const deleteDocument = async (id) => {
    return api.delete(`/api/documents/${id}`)
}

export const getDocumentAuditLogs = async (documentId) => {
    const res = await api.get(`/api/audit/${documentId}`)
    return res.logs
}
