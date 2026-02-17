// Document Details Page
import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getDocumentById, downloadOriginalDocument, downloadSignedDocument, triggerBlobDownload, deleteDocument } from "@/api/document.api"
import { getAllSignatures, deleteSignature, getAllPublicSignatures } from "@/api/signature.api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle,
    PenTool, Link2, Eye, FileQuestion, Hash, Calendar, Download, Trash2, Loader2,
    MoreVertical, X,
    ShieldCheck, History
} from "lucide-react"
import { toast } from "sonner"
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import PdfViewer from "@/components/PdfViewer"
import SignaturePlacer from "@/components/SignaturePlacer"
import SavedSignature from "@/components/SavedSignature"

function DocumentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [document, setDocument] = useState(null)
    const [internalSignature, setInternalSignature] = useState(null)
    const [publicSignatures, setPublicSignatures] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [isSigning, setIsSigning] = useState(false)
    const [isPublicMode, setIsPublicMode] = useState(false)
    const [showRequestDialog, setShowRequestDialog] = useState(false)
    const [requestEmail, setRequestEmail] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setLoading(true)
                const [docRes, intRes, pubRes] = await Promise.all([
                    getDocumentById(id),
                    getAllSignatures(id).catch(() => ({ signatures: null })),
                    getAllPublicSignatures(id).catch(() => ({ signatures: [] }))
                ])

                setDocument(docRes.document)
                setInternalSignature(intRes.signatures)
                setPublicSignatures(pubRes.signatures || [])
                setError("")
            } catch (err) {
                setError(err.message || "Failed to fetch document details")
            } finally {
                setLoading(false)
            }
        }
        fetchDocument()
    }, [id])

    const refreshSignature = async () => {
        try {
            const [intRes, pubRes] = await Promise.all([
                getAllSignatures(id).catch(() => ({ signatures: null })),
                getAllPublicSignatures(id).catch(() => ({ signatures: [] }))
            ])
            setInternalSignature(intRes.signatures)
            setPublicSignatures(pubRes.signatures || [])
            await refreshDocument()
            setIsSigning(false)
            setIsPublicMode(false)
            setShowRequestDialog(false)
            setRequestEmail("")
        } catch (err) {
            console.error("Failed to refresh signatures", err)
        }
    }

    const refreshDocument = async () => {
        try {
            const res = await getDocumentById(id)
            setDocument(res.document)
            setError("")
        } catch (err) {
            setError(err.message || "Failed to fetch document details")
        }
    }

    const handleDeleteSignature = async (sigId) => {
        if (!sigId) return
        try {
            setDeleting(true)
            await deleteSignature(sigId)
            await refreshSignature()
        } catch (err) {
            console.error("Failed to delete signature", err)
            setError(err.message || "Failed to delete signature")
        } finally {
            setDeleting(false)
        }
    }

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
            case "ready_to_sign":
                return (
                    <Badge className="text-sm font-semibold bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1">
                        <PenTool className="h-3.5 w-3.5 mr-1.5" />
                        Ready to Sign
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
            toast.success("Document deleted successfully")
            navigate("/dashboard")
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to delete document"
            toast.error(msg)
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
    const isReadyToSign = document.status?.toLowerCase() === "ready_to_sign"
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
                    <div className="flex flex-col sm:flex-row items-center gap-4 self-center lg:self-start lg:mt-6">
                        {/* 1. Signature Actions Pod */}
                        {(isPending || isReadyToSign) && (
                            <div className="relative flex items-center gap-1.5 bg-indigo-50/50 dark:bg-indigo-500/5 p-2 pt-6 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm transition-all duration-300">
                                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-indigo-400/80 pointer-events-none">
                                    {document.status?.toLowerCase() === "ready_to_sign" ? "Signature" : "Sign"}
                                </span>

                                {isPending && !internalSignature && publicSignatures.length === 0 && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsSigning(!isSigning)
                                                        setIsPublicMode(false)
                                                    }}
                                                    variant={isSigning && !isPublicMode ? "secondary" : "default"}
                                                    className={`h-8 gap-2 font-semibold transition-all ${isSigning && !isPublicMode ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                                                >
                                                    {isSigning && !isPublicMode ? <X className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
                                                    <span className="hidden xs:inline">
                                                        {isSigning && !isPublicMode ? "Cancel" : "Self Sign"}
                                                    </span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>{isSigning && !isPublicMode ? "Stop placing signature" : "Place your own signature"}</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* REQUEST PUBLIC SIGNATURE */}
                                        <div className="flex items-center gap-1.5">
                                            {isSigning && isPublicMode ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setIsSigning(false)
                                                                setIsPublicMode(false)
                                                                setRequestEmail("")
                                                            }}
                                                            className="h-8 gap-2 font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span className="hidden xs:inline">Cancel Request</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Cancel requesting signature</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <AlertDialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 gap-2 font-semibold border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                                >
                                                                    <Link2 className="h-4 w-4" />
                                                                    <span className="hidden xs:inline">Request</span>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p>Request signature from others</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Request Signature</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Enter the email address of the person you'd like to sign this document.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="py-2">
                                                            <label className="text-sm font-medium mb-1.5 block">Signer Email</label>
                                                            <Input
                                                                type="email"
                                                                placeholder="signer@example.com"
                                                                value={requestEmail}
                                                                onChange={(e) => setRequestEmail(e.target.value)}
                                                            />
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => setRequestEmail("")}>Cancel</AlertDialogCancel>
                                                            <Button
                                                                disabled={!requestEmail || !requestEmail.includes("@")}
                                                                onClick={() => {
                                                                    setIsPublicMode(true)
                                                                    setIsSigning(true)
                                                                    setShowRequestDialog(false)
                                                                }}
                                                            >
                                                                Start Placement
                                                            </Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* PUBLIC SIGNATURE ACTIONS (DELETE) */}
                                {publicSignatures.some(s => s.status === "pending") && (
                                    <>
                                        {(internalSignature || (isPending && publicSignatures.length === 0)) && (
                                            <div className="w-px h-4 bg-amber-200/50 dark:bg-amber-500/20 mx-1"></div>
                                        )}
                                        {publicSignatures
                                            .filter(s => s.status === "pending")
                                            .map(sig => (
                                                <AlertDialog key={sig.id}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={deleting}
                                                                    className="h-8 w-8 p-0 text-amber-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                                >
                                                                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <div className="text-center">
                                                                <p className="font-bold">Cancel Request</p>
                                                                <p className="text-[10px] opacity-80">{sig.signer_email_hint}</p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Cancel signature request?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove the signature placeholder for {sig.signer_email_hint} and invalidate their signing link.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Keep</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteSignature(sig.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Cancel Request
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ))}
                                    </>
                                )}

                                {internalSignature && (
                                    <>
                                        <div className="w-px h-4 bg-indigo-200/50 dark:bg-indigo-500/20 mx-1"></div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`/dashboard/documents/${id}/sign`)}
                                                    className="h-8 gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span className="hidden xs:inline">Finalize</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Finalize your signature</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <AlertDialog>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={deleting}
                                                            className="h-8 w-8 p-0 text-indigo-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                        >
                                                            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>Remove your signature placeholder</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove signature?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will remove your current signature placement.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSignature(internalSignature.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 2. Document Actions Pod */}
                        <div className="relative flex items-center gap-1.5 bg-card/80 backdrop-blur-sm p-2 pt-6 rounded-xl border border-border/60 shadow-sm">
                            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-indigo-400/80 pointer-events-none">
                                Document
                            </span>
                            {isSigned ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDownload("signed")}
                                            disabled={downloading}
                                            className="h-8 gap-2 font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 px-3"
                                        >
                                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                            Download Signed
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Download the finalized document with signatures</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDownload("original")}
                                            disabled={downloading}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                            title="Download Original"
                                        >
                                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Download original file</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            <div className="w-px h-4 bg-border/60 mx-1"></div>

                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={deleting}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Delete Document"
                                            >
                                                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Permanently delete this document</p>
                                    </TooltipContent>
                                </Tooltip>
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

                            <div className="w-px h-4 bg-border/60 mx-1"></div>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/dashboard/documents/${id}/audit`)}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                                    >
                                        <History className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>View Audit Trail</p>
                                </TooltipContent>
                            </Tooltip>
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
                    fileUrl={`${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}/download/${isSigned ? "signed" : "original"}?action=preview`}
                    onPageChange={setCurrentPage}
                >
                    {/* 1. Placement Mode */}
                    {isSigning && (
                        <SignaturePlacer
                            documentId={id}
                            pageNumber={currentPage}
                            signerEmail={isPublicMode ? requestEmail : null}
                            onSuccess={refreshSignature}
                            onCancel={() => {
                                setIsSigning(false)
                                setIsPublicMode(false)
                                setRequestEmail("")
                            }}
                        />
                    )}

                    {/* 2. Visualizing All Signatures */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                        {/* Internal Pending Signature */}
                        {!isSigning && internalSignature && internalSignature.status === "pending" && internalSignature.page_number === currentPage && (
                            <SavedSignature signature={internalSignature} />
                        )}

                        {/* Public Pending Signatures */}
                        {publicSignatures.map(sig => (
                            sig.status === "pending" && sig.page_number === currentPage && (
                                <SavedSignature key={sig.id} signature={sig} type="public" showPopover={true} />
                            )
                        ))}
                    </div>
                </PdfViewer>
            </div>
        </motion.div>
    )
}

export default DocumentDetails
