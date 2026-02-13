import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getDocumentById, downloadOriginalDocument, downloadSignedDocument, triggerBlobDownload, deleteDocument } from "@/api/document.api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle,
    PenTool, Link2, Eye, FileQuestion, Hash, Calendar, Download, Trash2, Loader2
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

function DocumentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [document, setDocument] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)

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

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Card className="border-border/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="pt-6 flex gap-3">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-44" />
                    </CardContent>
                </Card>
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

    if (!document) {
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
                <div className="flex flex-col items-center justify-center p-16 rounded-2xl border-2 border-dashed border-border/40 bg-muted/20 text-center">
                    <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
                        <FileQuestion className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Document not found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                        This document may have been removed or you don't have access to it.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 font-semibold"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const isPending = document.status?.toLowerCase() === "pending"
    const isSigned = document.status?.toLowerCase() === "signed"

    const handleDownload = async (variant = "original") => {
        try {
            setDownloading(true)
            const blob = variant === "signed"
                ? await downloadSignedDocument(id)
                : await downloadOriginalDocument(id)
            const suffix = variant === "signed" ? "_signed" : ""
            triggerBlobDownload(blob, `${document.title}${suffix}.pdf`)
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="gap-1.5 text-muted-foreground hover:text-foreground font-semibold -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                            {document.title}
                        </h1>
                    </div>
                    {getStatusBadge(document.status)}
                </div>
            </div>

            {/* Metadata Card */}
            <Card className="border-border/50 bg-card">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                        Document Information
                    </CardTitle>
                </CardHeader>
                <Separator className="mb-0" />
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <FileText className="h-3 w-3" />
                                Title
                            </div>
                            <p className="text-sm font-semibold text-foreground">{document.title}</p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Clock className="h-3 w-3" />
                                Status
                            </div>
                            <div>{getStatusBadge(document.status)}</div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Calendar className="h-3 w-3" />
                                Created
                            </div>
                            <p className="text-sm font-medium text-foreground">{formatDate(document.created_at)}</p>
                        </div>

                        {document.file_hash && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <Hash className="h-3 w-3" />
                                    File Hash
                                </div>
                                <p className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                                    {document.file_hash.substring(0, 16)}…
                                </p>
                            </div>
                        )}

                        {document.signed_file_path && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Signed File
                                </div>
                                <p className="text-sm font-medium text-emerald-600">Available</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-border/50 bg-card">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                        Actions
                    </CardTitle>
                </CardHeader>
                <Separator className="mb-0" />
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleDownload("original")}
                            disabled={downloading}
                            className="gap-2 font-semibold"
                        >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {downloading ? "Downloading..." : "Download Original"}
                        </Button>
                        {isPending && (
                            <>
                                <Button disabled className="gap-2 font-semibold">
                                    <PenTool className="h-4 w-4" />
                                    Place Signature
                                </Button>
                                <Button variant="outline" disabled className="gap-2 font-semibold">
                                    <Link2 className="h-4 w-4" />
                                    Generate Public Link
                                </Button>
                            </>
                        )}
                        {isSigned && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDownload("signed")}
                                    disabled={downloading}
                                    className="gap-2 font-semibold"
                                >
                                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                    Download Signed PDF
                                </Button>
                                <Button disabled variant="ghost" className="gap-2 font-semibold text-muted-foreground">
                                    <PenTool className="h-4 w-4" />
                                    Already Signed
                                </Button>
                            </>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    disabled={deleting}
                                    className="gap-2 font-semibold text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    {deleting ? "Deleting..." : "Delete"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the document
                                        <span className="font-semibold text-foreground"> "{document.title}" </span>
                                        and remove it from our servers.
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
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default DocumentDetails
