import { supabase } from "../config/supabase.js"
import { generateSignedPdf } from "../services/pdf.service.js"
import { checkEmailHash, checkFileHash, generateEmailHash } from "../utils/hash.js"
import { maskEmail } from "../utils/email.js"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"
import { logAuditEvent } from "../utils/logger.js"

dotenv.config()
const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

export async function createSignaturePlaceholder(req, res) {
    const { documentId, pageNumber, xPercent, yPercent } = req.body
    const userId = req.user.id

    if (
        documentId === undefined ||
        pageNumber === undefined ||
        xPercent === undefined ||
        yPercent === undefined
    ) {
        return res.status(400).json({ message: "All fields are required" })
    }
    if (typeof xPercent !== "number" || typeof yPercent !== "number" || typeof pageNumber !== "number") {
        return res.status(400).json({ message: "Coordinates or page number must be numbers" })
    }
    if (pageNumber < 1) {
        return res.status(400).json({ message: "Page number must be greater than or equal to 1" })
    }
    if (xPercent < 0 || xPercent > 100) {
        return res.status(400).json({ message: "x coordinate must be between 0 and 100" })
    }
    if (yPercent < 0 || yPercent > 100) {
        return res.status(400).json({ message: "y coordinate must be between 0 and 100" })
    }

    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("id, status")
            .eq("id", documentId)
            .eq("owner_id", userId)
            .maybeSingle()
        if (error) {
            return res.status(500).json({ message: "Error fetching document" })
        }

        if (!document) {
            return res.status(404).json({ message: "Document not found or not owned by user" })
        }

        if (document.status !== "pending") {
            return res.status(409).json({ message: "Document is not in pending state" })
        }

        const { data: existingSignature, error: existingSignatureError } = await supabase
            .from("signatures")
            .select("*")
            .eq("document_id", documentId)
            .eq("signer_type", "internal")
            .eq("signer_ref", userId)
            .limit(1)
            .maybeSingle()

        if (existingSignatureError) {
            return res.status(500).json({ message: "Error checking existing signature" })
        }

        if (existingSignature) {
            return res.status(409).json({ message: "Signature placeholder already exists" })
        }

        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .insert({
                document_id: documentId,
                signer_type: "internal",
                signer_ref: userId,
                page_number: pageNumber,
                x_percent: xPercent,
                y_percent: yPercent
            })
            .select()
            .single()
        if (signatureError) {
            return res.status(500).json({ message: "Failed to create signature" })
        }
        if (!signature) {
            return res.status(500).json({ message: "Failed to create signature" })
        }

        await logAuditEvent({
            documentId,
            actorType: "internal",
            actorRef: userId,
            action: "SIGNATURE_PLACEHOLDER_CREATED",
            ipAddress: req.ip
        })

        const { error: updatedDocumentError } = await supabase
            .from("documents")
            .update({ status: "ready_to_sign" })
            .eq("id", documentId)
        if (updatedDocumentError) {
            return res.status(500).json({ message: "Failed to update document status", error: updatedDocumentError.message })
        }

        return res.status(201).json({
            message: "Signature placeholder created",
            signature: {
                id: signature.id,
                documentId: signature.document_id,
                pageNumber: signature.page_number,
                xPercent: signature.x_percent,
                yPercent: signature.y_percent
            }
        })
    } catch (error) {
        console.error("Error creating signature:", error);
        return res.status(500).json({ message: "Error creating signature", error: error.message });
    }
}

export async function finalizeSignature(req, res) {
    const { documentId } = req.body
    const userId = req.user.id

    if (!documentId) {
        return res.status(400).json({ message: "Document ID is required" })
    }

    try {
        const { data: document, error: documentError } = await supabase
            .from("documents")
            .select("id, owner_id, original_file_path, signed_file_path, file_hash, status")
            .eq("id", documentId)
            .maybeSingle()
        if (documentError) {
            return res.status(500).json({ message: "Error fetching document" })
        }
        if (!document) {
            return res.status(404).json({ message: "Document not found" })
        }
        if (document.status !== "ready_to_sign") {
            return res.status(409).json({ message: "Document is not in ready to sign state" })
        }
        if (document.owner_id !== userId) {
            return res.status(403).json({ message: "Document not owned by user" })
        }
        if (document.signed_file_path) {
            return res.status(409).json({ message: "Document is already signed" })
        }

        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .select("id, signer_type, signer_ref, page_number, x_percent, y_percent, status")
            .eq("document_id", documentId)
            .eq("signer_type", "internal")
            .eq("signer_ref", userId)
            .maybeSingle()
        if (signatureError) {
            return res.status(500).json({ message: "Error fetching signature" })
        }
        if (!signature) {
            return res.status(404).json({ message: "Signature not found" })
        }
        if (signature.signer_type !== "internal") {
            return res.status(409).json({ message: "Signature is not for internal user" })
        }
        if (signature.signer_ref !== userId) {
            return res.status(403).json({ message: "Signature not owned by user" })
        }

        if (signature.status !== "pending") {
            return res.status(409).json({ message: "Signature is already consumed" })
        }

        const { data: fileBlob, error: fileError } = await supabase.storage
            .from("documents")
            .download(document.original_file_path)

        if (fileError) {
            return res.status(500).json({ message: "Error downloading document" })
        }
        if (!fileBlob) {
            return res.status(404).json({ message: "Document not found" })
        }

        const originalPdfBuffer = Buffer.from(await fileBlob.arrayBuffer())
        const isSameFile = checkFileHash(originalPdfBuffer, document.file_hash)
        if (!isSameFile) {
            return res.status(409).json({ message: "Document has been modified" })
        }

        const signedPdfBuffer = await generateSignedPdf(originalPdfBuffer, signature)

        await supabase.storage
            .from("documents")
            .upload(`signed/${documentId}.pdf`, signedPdfBuffer, {
                contentType: "application/pdf",
                upsert: false
            })

        await supabase
            .from("documents")
            .update({
                signed_file_path: `signed/${documentId}.pdf`,
                status: "signed"
            })
            .eq("id", documentId)

        await supabase
            .from("signatures")
            .update({
                status: "signed"
            })
            .eq("document_id", documentId)
            .eq("signer_type", "internal")
            .eq("signer_ref", userId)

        await logAuditEvent({
            documentId,
            actorType: "internal",
            actorRef: userId,
            action: "DOCUMENT_SIGNED_INTERNAL",
            ipAddress: req.ip
        })

        return res.status(200).json({
            message: "Document signed successfully",
        })
    } catch (error) {
        console.error("Error signing document:", error);
        return res.status(500).json({ message: "Error signing document", error: error.message });
    }
}

export async function createPublicSignaturePlaceholder(req, res) {
    const { documentId, pageNumber, xPercent, yPercent, signerEmail } = req.body
    const userId = req.user.id

    if (
        documentId === undefined ||
        pageNumber === undefined ||
        xPercent === undefined ||
        yPercent === undefined ||
        signerEmail === undefined
    ) {
        return res.status(400).json({ message: "All fields are required" })
    }
    if (typeof xPercent !== "number" || typeof yPercent !== "number" || typeof pageNumber !== "number") {
        return res.status(400).json({ message: "Coordinates or page number must be numbers" })
    }
    if (pageNumber < 1) {
        return res.status(400).json({ message: "Page number must be greater than or equal to 1" })
    }
    if (xPercent < 0 || xPercent > 100) {
        return res.status(400).json({ message: "x coordinate must be between 0 and 100" })
    }
    if (yPercent < 0 || yPercent > 100) {
        return res.status(400).json({ message: "y coordinate must be between 0 and 100" })
    }
    if (typeof signerEmail !== "string") {
        return res.status(400).json({ message: "Signer email must be a string" })
    }
    if (!signerEmail.trim()) {
        return res.status(400).json({ message: "Signer email cannot be empty" })
    }
    if (!EMAIL_REGEX.test(signerEmail)) {
        return res.status(400).json({ message: "Signer email is invalid" })
    }

    try {
        const { data: document, error } = await supabase
            .from("documents")
            .select("id, status")
            .eq("id", documentId)
            .eq("owner_id", userId)
            .maybeSingle()
        if (error) {
            return res.status(500).json({ message: "Error fetching document" })
        }

        if (!document) {
            return res.status(404).json({ message: "Document not found or not owned by user" })
        }

        if (document.status !== "pending") {
            return res.status(409).json({ message: "Document is not in pending state" })
        }

        const token = uuidv4()
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        const signerEmailHash = generateEmailHash(signerEmail)
        const signerEmailHint = maskEmail(signerEmail)

        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .insert({
                document_id: documentId,
                signer_type: "public",
                signer_ref: token,
                page_number: pageNumber,
                x_percent: xPercent,
                y_percent: yPercent,
                expires_at: expiresAt,
                signer_email_hash: signerEmailHash,
                signer_email_hint: signerEmailHint
            })
            .select()
            .single()
        if (signatureError) {
            return res.status(500).json({ message: "Failed to create signature" })
        }
        if (!signature) {
            return res.status(500).json({ message: "Failed to create signature" })
        }

        await logAuditEvent({
            documentId,
            actorType: "internal",
            actorRef: userId,
            action: "PUBLIC_SIGNATURE_LINK_CREATED",
            ipAddress: req.ip
        })

        const { error: updatedDocumentError } = await supabase
            .from("documents")
            .update({ status: "ready_to_sign" })
            .eq("id", documentId)
        if (updatedDocumentError) {
            return res.status(500).json({ message: "Failed to update document status" })
        }

        return res.status(201).json({
            message: "Public signature placeholder created",
            signature: {
                id: signature.id,
                documentId: signature.document_id,
                pageNumber: signature.page_number,
                xPercent: signature.x_percent,
                yPercent: signature.y_percent,
                token: token,
                link: `${process.env.FRONTEND_URL}/sign/public/${token}`,
                emailHint: signature.signer_email_hint
            }
        })
    } catch (error) {
        console.error("Error creating public signature:", error);
        return res.status(500).json({ message: "Error creating public signature", error: error.message });
    }
}

export async function getPublicSignature(req, res) {
    const { token } = req.params

    if (!token) {
        return res.status(400).json({ message: "Token is required" })
    }

    try {
        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .select("id, document_id, expires_at, signer_type, signer_ref, signer_email_hint, status, page_number, x_percent, y_percent, signer_email_hash")
            .eq("signer_ref", token)
            .maybeSingle()
        if (signatureError) {
            return res.status(500).json({ message: "Error fetching signature" })
        }
        if (!signature) {
            return res.status(404).json({ message: "Signature not found" })
        }

        const { email } = req.query
        if (email) {
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ message: "Invalid email format" })
            }
            if (!checkEmailHash(email, signature.signer_email_hash)) {
                return res.status(403).json({ message: "Email does not match intended signer" })
            }
        }
        if (signature.expires_at < new Date()) {
            return res.status(409).json({ message: "Signature has expired" })
        }
        if (signature.signer_type !== "public") {
            return res.status(409).json({ message: "Signature is not for public user" })
        }
        if (signature.signer_ref !== token) {
            return res.status(403).json({ message: "Signature not owned by user" })
        }

        if (signature.status !== "pending" && signature.status !== "signed") {
            return res.status(409).json({ message: "Signature is in an invalid state" })
        }

        const { data: document, error: documentError } = await supabase
            .from("documents")
            .select("status")
            .eq("id", signature.document_id)
            .maybeSingle()
        if (documentError) {
            return res.status(500).json({ message: "Error fetching document" })
        }
        if (!document) {
            return res.status(404).json({ message: "Document not found" })
        }
        if (document.status !== "pending" && document.status !== "ready_to_sign" && document.status !== "signed") {
            return res.status(409).json({ message: "Document is no longer accessible" })
        }

        return res.status(200).json({
            message: "Public signature fetched successfully",
            signature: {
                id: signature.id,
                documentId: signature.document_id,
                emailHint: signature.signer_email_hint,
                expiresAt: signature.expires_at,
                pageNumber: signature.page_number,
                xPercent: signature.x_percent,
                yPercent: signature.y_percent,
                status: signature.status
            }
        })
    } catch (error) {
        console.error("Error fetching public signature:", error);
        return res.status(500).json({ message: "Error fetching public signature", error: error.message });
    }
}

export async function finalizePublicSignature(req, res) {
    const { token } = req.params
    const { email } = req.body

    if (!token) {
        return res.status(400).json({ message: "Token is required" })
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
        if (signature.expires_at < new Date()) {
            return res.status(409).json({ message: "Signature has expired" })
        }
        if (signature.signer_type !== "public") {
            return res.status(409).json({ message: "Signature is not for public user" })
        }
        if (signature.signer_ref !== token) {
            return res.status(403).json({ message: "Signature not owned by user" })
        }
        if (signature.status !== "pending") {
            return res.status(409).json({ message: "Signature is already consumed" })
        }

        const documentId = signature.document_id

        const { data: document, error: documentError } = await supabase
            .from("documents")
            .select("id, owner_id, original_file_path, signed_file_path, file_hash, status")
            .eq("id", documentId)
            .maybeSingle()
        if (documentError) {
            return res.status(500).json({ message: "Error fetching document" })
        }
        if (!document) {
            return res.status(404).json({ message: "Document not found" })
        }
        if (document.status !== "ready_to_sign") {
            return res.status(409).json({ message: "Document is not in ready to sign state" })
        }
        if (document.signed_file_path) {
            return res.status(409).json({ message: "Document is already signed" })
        }

        const { data: fileBlob, error: fileError } = await supabase.storage
            .from("documents")
            .download(document.original_file_path)

        if (fileError) {
            return res.status(500).json({ message: "Error downloading document" })
        }
        if (!fileBlob) {
            return res.status(404).json({ message: "Document not found" })
        }

        const originalPdfBuffer = Buffer.from(await fileBlob.arrayBuffer())
        const isSameFile = checkFileHash(originalPdfBuffer, document.file_hash)
        if (!isSameFile) {
            return res.status(409).json({ message: "Document has been modified" })
        }

        const signedPdfBuffer = await generateSignedPdf(originalPdfBuffer, signature)

        await supabase.storage
            .from("documents")
            .upload(`signed/${documentId}.pdf`, signedPdfBuffer, {
                contentType: "application/pdf",
                upsert: false
            })

        await supabase
            .from("documents")
            .update({
                signed_file_path: `signed/${documentId}.pdf`,
                status: "signed"
            })
            .eq("id", documentId)

        await supabase
            .from("signatures")
            .update({
                status: "signed"
            })
            .eq("document_id", documentId)
            .eq("signer_type", "public")
            .eq("signer_ref", token)

        await logAuditEvent({
            documentId,
            actorType: "public",
            actorRef: token,
            action: "DOCUMENT_SIGNED_PUBLIC",
            ipAddress: req.ip
        })

        return res.status(200).json({
            message: "Public document signed successfully",
        })
    } catch (error) {
        console.error("Error signing public document:", error);
        return res.status(500).json({ message: "Error signing public document", error: error.message });
    }
}

export async function getAllSignatures(req, res) {
    const { documentId } = req.params
    const userId = req.user.id

    if (!documentId) {
        return res.status(400).json({ message: "Document ID is required" })
    }

    try {
        const { data: signatures, error } = await supabase
            .from("signatures")
            .select("*")
            .eq("document_id", documentId)
            .eq("signer_ref", userId)
            .maybeSingle()
        if (error) {
            return res.status(500).json({ message: "Error fetching signatures" })
        }
        if (!signatures) {
            return res.status(404).json({ message: "Signatures not found" })
        }

        return res.status(200).json({
            message: "Signatures fetched successfully",
            signatures
        })
    } catch (error) {
        console.error("Error fetching signatures:", error);
        return res.status(500).json({ message: "Error fetching signatures", error: error.message });
    }
}

export async function deleteSignature(req, res) {
    const { id } = req.params
    const userId = req.user.id

    if (!id) {
        return res.status(400).json({ message: "Signature ID is required" })
    }

    try {
        const { data: signature, error: signatureError } = await supabase
            .from("signatures")
            .select("*")
            .eq("id", id)
            .eq("signer_ref", userId)
            .maybeSingle()
        if (signatureError) {
            return res.status(500).json({ message: "Error fetching signature" })
        }
        if (!signature) {
            return res.status(404).json({ message: "Signature not found" })
        }
        if (signature.status === "signed") {
            return res.status(400).json({ message: "Signature is already consumed" })
        }

        const { error: deleteError } = await supabase
            .from("signatures")
            .delete()
            .eq("id", id)
        if (deleteError) {
            return res.status(500).json({ message: "Error deleting signature" })
        }

        const { error: documentError } = await supabase
            .from("documents")
            .update({
                status: "pending"
            })
            .eq("id", signature.document_id)
        if (documentError) {
            return res.status(500).json({ message: "Error updating document status" })
        }

        await logAuditEvent({
            documentId: signature.document_id,
            actorType: "internal",
            actorRef: userId,
            action: "SIGNATURE_PLACEHOLDER_DELETED",
            ipAddress: req.ip
        })

        return res.status(200).json({
            message: "Signature deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting signature:", error);
        return res.status(500).json({ message: "Error deleting signature", error: error.message });
    }
}

export async function getAllPublicSignatures(req, res) {
    const { documentId } = req.params
    const userId = req.user.id

    if (!documentId) {
        return res.status(400).json({ message: "Document ID is required" })
    }

    try {
        const { data: document, error: docError } = await supabase
            .from("documents")
            .select("id")
            .eq("id", documentId)
            .eq("owner_id", userId)
            .maybeSingle()

        if (docError || !document) {
            return res.status(403).json({ message: "Not authorized to view signatures for this document" })
        }

        const { data: signatures, error: signaturesError } = await supabase
            .from("signatures")
            .select("*")
            .eq("document_id", documentId)
            .eq("signer_type", "public")

        if (signaturesError) {
            return res.status(500).json({ message: "Error fetching public signatures" })
        }

        return res.status(200).json({ signatures: signatures || [] })
    } catch (error) {
        console.error("Error fetching public signatures:", error);
        return res.status(500).json({ message: "Error fetching public signatures", error: error.message });
    }
}