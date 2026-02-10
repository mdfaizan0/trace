import { supabase } from "../config/supabase.js";

export async function logAuditEvent({
    documentId,
    actorType,
    actorRef,
    action,
    ipAddress
}) {
    await supabase
        .from("audit_logs")
        .insert({
            document_id: documentId,
            actor_type: actorType,
            actor_ref: actorRef,
            action,
            ip_address: ipAddress
        })
}