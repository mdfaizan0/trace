import { supabase } from "../config/supabase.js"

export async function getDocumentAuditLogs(req, res) {
    const { documentId } = req.params
    try {
        const { data: logs, error: logsError } = await supabase
            .from("audit_logs")
            .select("*")
            .eq("document_id", documentId)
            .order("created_at", { ascending: false })

        if (logsError) {
            return res.status(500).json({ message: "Error fetching audit logs", error: logsError.message })
        }

        return res.status(200).json({
            message: "Audit logs fetched successfully",
            logs
        })
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ message: "Error fetching audit logs", error: error.message });
    }
}