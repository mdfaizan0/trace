import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { finalizeInternalSignature } from "@/api/signature.api"
import { getDocumentById } from "@/api/document.api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function SignInternal() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [document, setDocument] = useState(null)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await getDocumentById(id)
                setDocument(response.document)
                if (response.document.status !== "ready_to_sign") {
                    setError("This document is already finalized or not available for signing.")
                }
            } catch (err) {
                setError("Failed to load document details.")
            } finally {
                setPageLoading(false)
            }
        }
        fetchDocument()
    }, [id])

    const handleFinalize = async () => {
        setLoading(true)
        setError("")
        try {
            await finalizeInternalSignature({ documentId: id })
            toast.success("Document signed successfully")
            setSuccess(true)
            // Redirect after a short delay to let user see success state
            setTimeout(() => {
                navigate(`/dashboard/documents/${id}`)
            }, 2000)
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || err.message || "Failed to finalize signature. Please try again."
            toast.error(msg)
            setError(msg)
            setLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dashboard/documents/${id}`)}
                className="mb-8 gap-1 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Document
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border-border/60 shadow-md overflow-hidden relative">
                    {/* Success Overlay */}
                    {success && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Successfully Signed!</h2>
                            <p className="text-muted-foreground">Redirecting you back to the document...</p>
                        </div>
                    )}

                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="mx-auto h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Finalize Signature</CardTitle>
                        <CardDescription>
                            Review and confirm your action for <span className="font-medium text-foreground">"{document?.title}"</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-muted/40 p-4 rounded-lg border border-border/50 text-sm text-muted-foreground space-y-2">
                            <p className="flex gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                                <span>This action will <strong>permanently embed your signature</strong> into the document.</span>
                            </p>
                            <p className="pl-6">
                                The document status will change to <strong>Signed</strong> and it will be locked for further editing.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Separator />

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                size="lg"
                                onClick={handleFinalize}
                                disabled={loading || success || !!error}
                                className="w-full font-semibold text-base"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {loading ? "Signing..." : "Confirm & Sign"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate(`/dashboard/documents/${id}`)}
                                disabled={loading || success}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
