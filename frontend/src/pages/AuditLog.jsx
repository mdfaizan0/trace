import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { getDocumentAuditLogs } from "@/api/document.api"
import { formatDate } from "@/lib/date"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    History,
    ArrowLeft,
    FileUp,
    PenTool,
    ShieldCheck,
    Globe,
    AlertCircle,
    Clock,
    User,
    Download,
    Trash2,
    Activity,
    ExternalLink
} from "lucide-react"

const ACTION_MAP = {
    "DOCUMENT_UPLOADED": {
        label: "Document Source Initialized",
        icon: FileUp,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        description: "Initial file upload and metadata registration."
    },
    "SIGNATURE_PLACEHOLDER_CREATED": {
        label: "Signature Authority Defined",
        icon: Clock,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
        description: "Drafted a signature field for internal validation."
    },
    "SIGNATURE_PLACEHOLDER_DELETED": {
        label: "Validation Point Revoked",
        icon: Trash2,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20",
        description: "An unconsumed signature placeholder was removed."
    },
    "DOCUMENT_SIGNED_INTERNAL": {
        label: "Credential Verification Finalized",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        description: "Owner signature applied and document state locked."
    },
    "PUBLIC_SIGNATURE_LINK_CREATED": {
        label: "Inbound Signing Link Generated",
        icon: Globe,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        description: "Temporary external access granted for signature collection."
    },
    "DOCUMENT_SIGNED_PUBLIC": {
        label: "Remote Signature Captured",
        icon: PenTool,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        description: "Verified public signer successfully applied their credentials."
    },
    "ORIGINAL_DOCUMENT_DOWNLOADED": {
        label: "Reference Source Accessed",
        icon: Download,
        color: "text-slate-500",
        bgColor: "bg-slate-500/10",
        borderColor: "border-slate-500/20",
        description: "Original document binary retrieved for review."
    },
    "SIGNED_DOCUMENT_DOWNLOADED": {
        label: "Certified Copy Retrieved",
        icon: Download,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
        description: "Finalized document containing all verified artifacts was downloaded."
    },
    "DOCUMENT_DELETED": {
        label: "Asset Decommissioned",
        icon: Trash2,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
        description: "Document and all related metadata permanently purged."
    }
}

const DEFAULT_ACTION = {
    label: "Registry Update",
    icon: History,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    description: "An internal system state change was recorded."
}

function AuditLog() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true)
                const data = await getDocumentAuditLogs(id)
                setLogs(data || [])
            } catch (err) {
                console.error("Failed to fetch audit logs:", err)
                setError(err.response?.data?.message || err.message || "Failed to load audit trail")
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [id])

    const getActorDisplay = (log) => {
        if (log.actor_type === "internal") return "Owner (You)"
        if (log.actor_type === "public") return "Verified Signer"
        return "System Automator"
    }

    if (loading) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto py-12 px-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
                <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-6 items-start">
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="space-y-3 flex-1">
                                <Skeleton className="h-6 w-1/4 rounded-md" />
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto py-20 px-6">
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-2xl overflow-hidden p-6 rounded-2xl animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <div className="space-y-2">
                            <AlertTitle className="text-xl font-bold">Trace Failure</AlertTitle>
                            <AlertDescription className="text-muted-foreground leading-relaxed">
                                {error}
                            </AlertDescription>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-xl font-semibold">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                            <Button size="sm" onClick={() => window.location.reload()} className="rounded-xl bg-destructive hover:bg-destructive/90 font-semibold shadow-lg shadow-destructive/20">
                                Retry Session
                            </Button>
                        </div>
                    </div>
                </Alert>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 max-w-5xl mx-auto py-12 px-6"
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2 text-muted-foreground hover:text-foreground transition-all font-semibold rounded-xl group px-0 hover:bg-transparent"
                >
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted group-hover:scale-105 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span>Back to Document</span>
                </Button>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted/20 px-4 py-2 rounded-full border border-border/40 backdrop-blur-sm">
                    <Activity className="h-3.5 w-3.5" />
                    Real-time Security Ledger
                </div>
            </div>

            {/* Page Title Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                        <History className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
                        Audit Trail
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative">
                {logs.length === 0 ? (
                    <Card className="border-border/40 bg-card/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl py-20">
                        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                <div className="relative w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center ring-1 ring-border">
                                    <History className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Ledger Empty</h2>
                                <p className="text-muted-foreground max-w-xs mx-auto">This asset hasn't recorded any state changes since its creation.</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="relative space-y-4">
                        {/* THE TIMELINE STEM - Exactly centered behind the icons (1.5rem / 24px) */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-linear-to-b from-primary/30 via-primary/15 to-transparent z-0 hidden sm:block" />

                        <div className="grid gap-6">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log, index) => {
                                    const action = ACTION_MAP[log.action] || DEFAULT_ACTION
                                    const Icon = action.icon

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative flex items-start gap-4 sm:gap-8"
                                        >
                                            <div className="relative z-10 shrink-0 mt-1 sm:mt-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ring-inset shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg ${action.bgColor} ${action.borderColor} ${action.color} ring-white/10`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            </div>

                                            {/* Content Card - Modern high-polish bubble */}
                                            <div className="flex-1 min-w-0">
                                                <div className="relative p-6 rounded-4xl bg-card/40 border border-border/40 transition-all duration-500 group-hover:bg-card/80 group-hover:border-primary/20 group-hover:-translate-y-1 shadow-xs hover:shadow-2xl hover:shadow-primary/5 cursor-default overflow-hidden">

                                                    {/* Background Glow */}
                                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-1000 rounded-full -mr-16 -mt-16 ${action.bgColor}`} />

                                                    <div className="relative space-y-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                            <div className="space-y-1.5">
                                                                <h3 className="text-lg font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors flex items-center gap-2">
                                                                    {action.label}
                                                                    <div className={`h-1.5 w-1.5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ${action.bgColor.replace('10', '50')}`} />
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                                                                    {action.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                <span className="text-sm font-bold font-mono text-muted-foreground/60 tabular-nums">
                                                                    {formatDate(log.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Separator / Metadata Footer */}
                                                        <div className="pt-4 border-t border-border/20 flex flex-wrap items-center gap-4">
                                                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/20 group-hover:bg-muted/50 transition-colors">
                                                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center shadow-sm ${log.actor_type === 'internal' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                                                    {log.actor_type === "internal" ? <User className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                                                                </div>
                                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                                                    {getActorDisplay(log)}
                                                                </span>
                                                            </div>

                                                            {log.ip_address && (
                                                                <div className="text-[10px] font-mono font-bold text-muted-foreground/60 bg-muted/20 px-2.5 py-1 rounded-md border border-border/10">
                                                                    ID: {log.ip_address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </motion.div >
    )
}

export default AuditLog
