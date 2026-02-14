// Document Details Page
import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getDocumentById, downloadOriginalDocument, downloadSignedDocument, triggerBlobDownload, deleteDocument } from "@/api/document.api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle,
    PenTool, Link2, Eye, FileQuestion, Hash, Calendar, Download, Trash2, Loader2,
    MoreVertical, X
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PdfViewer from "@/components/PdfViewer"
import SignaturePlacer from "@/components/SignaturePlacer"

function DocumentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [document, setDocument] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [isSigning, setIsSigning] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setLoading(true)
                const response = await getDocumentById(id)
                setDocument(response.document)
                setError("")
            } catch (err) {
                setError(err.message || "Failed to fetch document")
            } finally {
                setLoading(false)
            }
        }
        fetchDocument()
    }, [id])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "signed":
                return (
                    <Badge className="text-sm font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Signed
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="secondary" className="text-sm font-semibold bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 px-3 py-1">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Pending
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="text-sm capitalize px-3 py-1">
                        {status || "Unknown"}
                    </Badge>
                )
        }
    }

    const handleDownload = async (variant = "original") => {
        try {
            setDownloading(true)
            const blob = variant === "signed"
                ? await downloadSignedDocument(id)
                : await downloadOriginalDocument(id)
            const suffix = variant === "signed" ? "_signed" : ""
            triggerBlobDownload(blob, `${document?.title || "document"}${suffix}.pdf`)
        } catch (err) {
            setError(err.message || "Failed to download document")
        } finally {
            setDownloading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setDeleting(true)
            await deleteDocument(id)
            navigate("/dashboard")
        } catch (err) {
            setError(err.message || "Failed to delete document")
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="gap-1.5 text-muted-foreground hover:text-foreground font-semibold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!document) return null

    const isPending = document.status?.toLowerCase() === "pending"
    const isSigned = document.status?.toLowerCase() === "signed"

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Consolidated Header */}
            <div className="flex flex-col gap-6 border-b border-border/40 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Title & Meta */}
                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/dashboard")}
                                className="gap-1 px-0 h-6 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                                {document.title}
                            </h1>
                            {getStatusBadge(document.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(document.created_at)}</span>
                            </div>
                            {document.file_hash && (
                                <div className="flex items-center gap-1.5" title={document.file_hash}>
                                    <Hash className="h-3.5 w-3.5" />
                                    <span className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                                        {document.file_hash.substring(0, 12)}...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions Toolbar */}
                    <div className="flex items-center gap-2 self-start lg:mt-6">
                        {/* Primary Actions */}
                        {isPending && (
                            <Button
                                size="sm"
                                onClick={() => setIsSigning(!isSigning)}
                                variant={isSigning ? "secondary" : "default"}
                                className={`gap-2 font-semibold shadow-sm ${isSigning ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                            >
                                {isSigning ? <X className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
                                {isSigning ? "Cancel Signing" : "Sign Document"}
                            </Button>
                        )}

                        {isSigned && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload("signed")}
                                disabled={downloading}
                                className="gap-2 font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/50"
                            >
                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Download Signed
                            </Button>
                        )}

                        {/* Secondary Actions Menu (Mobile/Desktop) */}
                        <div className="flex items-center gap-1 bg-card border border-border/60 p-1 rounded-lg shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload("original")}
                                disabled={downloading}
                                className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
                                title="Download Original"
                            >
                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>

                            <div className="w-px h-4 bg-border/60 mx-0.5"></div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={deleting}
                                        className="h-8 px-2.5 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Delete Document"
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete <span className="font-semibold text-foreground">"{document.title}"</span>. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Viewer Area */}
            <div className="group relative">
                {/* Visual indicator for signed version */}
                {isSigned && (
                    <div className="absolute top-4 right-6 z-10 pointer-events-none">
                        <Badge variant="outline" className="bg-emerald-500/90 text-white border-transparent shadow-sm backdrop-blur-sm">
                            Verified Signed PDF
                        </Badge>
                    </div>
                )}

                {isSigning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <div className="bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                            <PenTool className="h-4 w-4" />
                            Click anywhere to place signature
                        </div>
                    </div>
                )}

                <PdfViewer
                    fileUrl={`${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}/download/${isSigned ? "signed" : "original"}`}
                    onPageChange={setCurrentPage}
                >
                    {isSigning && isPending && (
                        <SignaturePlacer
                            documentId={id}
                            pageNumber={currentPage}
                            onSuccess={() => setIsSigning(false)}
                            onCancel={() => setIsSigning(false)}
                        />
                    )}
                </PdfViewer>
            </div>
        </motion.div>
    )
}

export default DocumentDetails
