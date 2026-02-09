import { supabase } from "../config/supabase.js"

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