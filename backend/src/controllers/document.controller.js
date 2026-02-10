import { supabase } from "../config/supabase.js"
import { uploadFile } from "../services/storage.service.js"
import { generateFileHash } from "../utils/hash.js"
import { logAuditEvent } from "../utils/logger.js"

export async function documentUpload(req, res) {
    const file = req.file
    const { title } = req.body
    const userId = req.user.id

    if (!file || !title) {
        return res.status(400).json({ message: "All fields are required" })
    }

    if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Invalid file type" })
    }

    try {
        const fileHash = generateFileHash(file.buffer)
        const { data: existingDocument, error: existingDocumentError } = await supabase
            .from("documents")
            .select("id")
            .eq("file_hash", fileHash)
            .eq("owner_id", userId)
            .single()

        if (existingDocumentError && existingDocumentError.code !== "PGRST116") {
            return res.status(500).json({ message: "Error checking for existing document", error: existingDocumentError.message });
        }

        if (existingDocument) {
            return res.status(400).json({ message: "Same document already exists" });
        }

        const filePath = await uploadFile(file, userId)
        const { data: document, error } = await supabase
            .from("documents")
            .insert({
                owner_id: userId,
                title,
                original_file_path: filePath,
                file_hash: fileHash
            })
            .select()
            .single()

        if (error || !document) {
            return res.status(500).json({ message: "Error creating document", error: error.message });
        }

        await logAuditEvent({
            documentId: document.id,
            actorType: "internal",
            actorRef: userId,
            action: "DOCUMENT_UPLOADED",
            ipAddress: req.ip
        })

        return res.status(201).json({
            message: "Document created successfully",
            document: {
                id: document.id,
                title: document.title,
                createdAt: document.created_at
            }
        });
    } catch (error) {
        console.error("Error creating document:", error);
        return res.status(500).json({ message: "Error creating document", error: error.message });
    }
}