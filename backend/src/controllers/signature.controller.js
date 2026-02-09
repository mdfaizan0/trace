import { supabase } from "../config/supabase.js"
import { generateSignedPdf } from "../services/pdf.service.js"
import { checkFileHash } from "../utils/hash.js"

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
                y_percent: yPercent,
            })
            .select()
            .single()
        if (signatureError) {
            return res.status(500).json({ message: "Failed to create signature" })
        }
        if (!signature) {
            return res.status(500).json({ message: "Failed to create signature" })
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
        if (document.status !== "pending") {
            return res.status(409).json({ message: "Document is not in pending state" })
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

        return res.status(200).json({
            message: "Document signed successfully",
        })
    } catch (error) {
        console.error("Error signing document:", error);
        return res.status(500).json({ message: "Error signing document", error: error.message });
    }
}