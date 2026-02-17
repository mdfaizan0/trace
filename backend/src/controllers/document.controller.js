import { supabase } from "../config/supabase.js"
import { uploadFile } from "../services/storage.service.js"
import { checkEmailHash, generateFileHash } from "../utils/hash.js"
import { logAuditEvent } from "../utils/logger.js"

const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

export async function documentUpload(req, res) {
    const file = req.file
    const { title } = req.body
    const userId = req.user.id

    if (!file) {
        return res.status(400).json({ message: "File is required" })
    }

    if (!title) {
        return res.status(400).json({ message: "Title is required" })
    }

    if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Invalid file type" })
    }

    if (file.size > 1024 * 1024 * 20) {
        return res.status(400).json({ message: "File size exceeds limit" })
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
            ipAddress: req.headers["x-forwarded-for"] || req.ip
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

export async function getAllDocuments(req, res) {
    try {
        const { data: documents, error } = await supabase
            .from("documents")
            .select("*")
            .eq("owner_id", req.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            return res.status(500).json({ message: "Error fetching documents", error: error.message });
        }

        return res.status(200).json({
            message: "Documents fetched successfully",
            documents
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        return res.status(500).json({ message: "Error fetching documents", error: error.message });
    }
}

export async function getDocumentById(req, res) {
    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", req.params.id)
            .eq("owner_id", req.user.id)
            .single()

        if (error) {
            return res.status(500).json({ message: "Error fetching document", error: error.message });
        }

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        return res.status(200).json({
            message: "Document fetched successfully",
            document
        });
    } catch (error) {
        console.error("Error fetching document:", error);
        return res.status(500).json({ message: "Error fetching document", error: error.message });
    }
}

export async function downloadOriginalDocument(req, res) {
    const { action } = req.query
    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", req.params.id)
            .eq("owner_id", req.user.id)
            .single()

        if (error) {
            return res.status(500).json({ message: "Error fetching document", error: error.message });
        }

        if (!document) {
            return res.status(404).json({ message: "Original document not found" });
        }

        const { data: file, error: fileError } = await supabase.storage
            .from("documents")
            .download(document.original_file_path)

        if (fileError) {
            return res.status(500).json({ message: "Error downloading original document", error: fileError.message });
        }

        if (action !== "preview") {
            await logAuditEvent({
                documentId: document.id,
                actorType: "internal",
                actorRef: req.user.id,
                action: "ORIGINAL_DOCUMENT_DOWNLOADED",
                ipAddress: req.headers["x-forwarded-for"] || req.ip
            })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `attachment; filename="${document.title}.pdf"`);
        res.send(buffer);
    } catch (error) {
        console.error("Error downloading original document:", error);
        return res.status(500).json({ message: "Error downloading original document", error: error.message });
    }
}

export async function downloadSignedDocument(req, res) {
    const { action } = req.query
    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", req.params.id)
            .eq("owner_id", req.user.id)
            .eq("status", "signed")
            .single()

        if (error) {
            return res.status(500).json({ message: "Error fetching signed document", error: error.message });
        }

        if (!document) {
            return res.status(404).json({ message: "Signed document not found" });
        }

        const { data: file, error: fileError } = await supabase.storage
            .from("documents")
            .download(document.signed_file_path)

        if (fileError) {
            return res.status(500).json({ message: "Error downloading document", error: fileError.message });
        }

        if (action !== "preview") {
            await logAuditEvent({
                documentId: document.id,
                actorType: "internal",
                actorRef: req.user.id,
                action: "SIGNED_DOCUMENT_DOWNLOADED",
                ipAddress: req.headers["x-forwarded-for"] || req.ip
            })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `attachment; filename="${document.title}.pdf"`);
        res.send(buffer);
    } catch (error) {
        console.error("Error downloading signed document:", error);
        return res.status(500).json({ message: "Error downloading signed document", error: error.message });
    }
}

export async function deleteDocument(req, res) {
    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", req.params.id)
            .eq("owner_id", req.user.id)
            .single()

        if (error) {
            return res.status(500).json({ message: "Error fetching document", error: error.message });
        }

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const { error: deleteDocumentFromStorageError } = await supabase.storage
            .from("documents")
            .remove([document.original_file_path])

        if (document.signed_file_path) {
            const { error: deleteSignedDocumentFromStorageError } = await supabase.storage
                .from("documents")
                .remove([document.signed_file_path])

            if (deleteSignedDocumentFromStorageError) {
                return res.status(500).json({ message: "Error deleting signed document from storage", error: deleteSignedDocumentFromStorageError.message });
            }
        }

        if (deleteDocumentFromStorageError) {
            return res.status(500).json({ message: "Error deleting document from storage", error: deleteDocumentFromStorageError.message });
        }

        const { error: deleteDocumentError } = await supabase
            .from("documents")
            .delete()
            .eq("id", req.params.id)
            .eq("owner_id", req.user.id)

        if (deleteDocumentError) {
            return res.status(500).json({ message: "Error deleting document", error: deleteDocumentError.message });
        }

        await logAuditEvent({
            documentId: document.id,
            actorType: "internal",
            actorRef: req.user.id,
            action: "DOCUMENT_DELETED",
            ipAddress: req.headers["x-forwarded-for"] || req.ip
        })

        return res.status(200).json({
            message: "Document deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({ message: "Error deleting document", error: error.message });
    }
}

export async function downloadDocumentForPublic(req, res) {
    const { token } = req.params
    const { type, email } = req.query

    if (!type || !["original", "signed"].includes(type)) {
        return res.status(400).json({ message: "Invalid document type" })
    }

    if (!EMAIL_REGEX.test(email || "")) {
        return res.status(400).json({ message: "Invalid email format" })
    }
    try {
        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .select("*")
            .eq("signer_type", "public")
            .eq("signer_ref", token)
            .maybeSingle()
        if (signatureError) {
            return res.status(500).json({ message: "Error fetching signature" })
        }
        if (!signature) {
            return res.status(404).json({ message: "Signature not found" })
        }
        if (!checkEmailHash(email, signature.signer_email_hash)) {
            return res.status(403).json({ message: "Email does not match intended signer" })
        }
        if (type === "original") {
            if (signature.expires_at < new Date()) {
                return res.status(409).json({ message: "Signature has expired" })
            }
            if (signature.status !== "pending") {
                return res.status(409).json({ message: "Signature is already consumed" })
            }
        }
        if (signature.signer_type !== "public") {
            return res.status(409).json({ message: "Signature is not for public user" })
        }
        if (signature.signer_ref !== token) {
            return res.status(403).json({ message: "Signature not owned by user" })
        }

        const documentId = signature.document_id

        const { data: document, error: documentError } = await supabase
            .from("documents")
            .select("id, owner_id, original_file_path, signed_file_path, file_hash, status, title")
            .eq("id", documentId)
            .maybeSingle()
        if (documentError) {
            return res.status(500).json({ message: "Error fetching document" })
        }
        if (!document) {
            return res.status(404).json({ message: "Document not found" })
        }
        if (type === "original") {
            if (document.status !== "pending" && document.status !== "ready_to_sign") {
                return res.status(409).json({ message: "Document is not in a signable state" })
            }
            if (document.signed_file_path) {
                return res.status(409).json({ message: "Document is already signed" })
            }
        }

        if (type === "signed" && !document.signed_file_path) {
            return res.status(404).json({ message: "Signed document version not available yet" })
        }

        const { data: file, error: fileError } = await supabase.storage
            .from("documents")
            .download(type === "original" ? document.original_file_path : document.signed_file_path)

        if (fileError) {
            return res.status(500).json({ message: `Error downloading ${type} document`, error: fileError.message });
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        res.set("Content-Type", "application/pdf");
        const filename = type === "signed" ? `${document.title}_signed.pdf` : `${document.title}.pdf`
        res.set("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error("Error downloading public document:", error);
        return res.status(500).json({ message: "Error downloading public document", error: error.message });
    }
}
