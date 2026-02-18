import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPublicSignature, finalizePublicSignature } from "@/api/signature.api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, Mail, ArrowRight, Home, Loader2, CheckCircle2 } from "lucide-react"
import Logo from "@/components/ui/Logo"
import { format } from "date-fns"
import PdfViewer from "@/components/PdfViewer"
import SavedSignature from "@/components/SavedSignature"
import { toast } from "sonner"

function PublicSign() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [isExpired, setIsExpired] = useState(false)

    // Phase 14 states
    const [email, setEmail] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [finalizeError, setFinalizeError] = useState(null)
    const [showForm, setShowForm] = useState(false)

    // PDF state
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        async function fetchSignature() {
            try {
                setLoading(true)
                const res = await getPublicSignature(token)
                const sigData = res.signature
                setData(sigData)

                // Check expiration
                if (new Date(sigData.expires_at) < new Date()) {
                    setIsExpired(true)
                }
            } catch (err) {
                console.error("Failed to fetch public signature:", err)
                if (err.status === 409 && err.message?.toLowerCase().includes("expired")) {
                    setIsExpired(true)
                } else {
                    setError(err.message || "Invalid or link has already been used.")
                }
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchSignature()
        }
    }, [token])

    const handleFinalize = async (e) => {
        e.preventDefault()
        if (!email.trim()) return

        try {
            setSubmitting(true)
            setFinalizeError(null)
            await finalizePublicSignature(token, { email })
            toast.success("Document signed successfully")
            setIsSuccess(true)
        } catch (err) {
            console.error("Failed to finalize public signature:", err)
            if (err.status === 409 && err.message?.toLowerCase().includes("expired")) {
                setIsExpired(true)
            } else {
                const msg = err.response?.data?.message || err.message || "Failed to sign document. Please check your email and try again."
                toast.error(msg)
                setFinalizeError(msg)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/api/documents/${token}/view?type=${isSuccess ? "signed" : "original"}${email ? `&email=${email}` : ""}`

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-200 via-amber-500 to-amber-200" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8 text-primary font-bold text-2xl relative z-10 transition-all hover:scale-[1.02]">
                <Logo className="h-8 w-8" />
                <span>Trace <span className="text-muted-foreground/60 font-medium">Public</span></span>
            </div>

            <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 relative z-10 flex-1">
                {/* PDF Viewer Side (Only shown when ready to sign) */}
                <div className="flex-1 order-2 lg:order-1 min-w-0">
                    {(data && showForm && !isExpired) ? (
                        <div className="h-full">
                            <PdfViewer
                                fileUrl={pdfUrl}
                                isPublic={true}
                                publicEmail={email}
                                onPageChange={setCurrentPage}
                            >
                                {/* Show the placeholder only during the signing process (not after) */}
                                {!isSuccess && ((data.pageNumber ?? data.page_number) === currentPage) && (
                                    <SavedSignature signature={data} type="public" />
                                )}
                            </PdfViewer>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border border-dashed border-border/60 rounded-xl bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mb-4">
                                <Logo className="h-8 w-8 grayscale opacity-20" />
                            </div>
                            <h3 className="text-lg font-semibold text-muted-foreground/60">Document Preview</h3>
                            <p className="text-sm text-muted-foreground/40 max-w-xs mt-2 italic">
                                Please confirm your identity to view and sign the document.
                            </p>
                        </div>
                    )}
                </div>

                {/* Info / Sign Card Side */}
                <aside className="w-full lg:w-[400px] order-1 lg:order-2 shrink-0">
                    <Card className="shadow-xl border-border/40 sticky top-8">
                        {loading ? (
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        ) : error || isExpired ? (
                            <>
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <CardTitle className="text-xl">
                                        {isExpired ? "Link Expired" : "Invalid Link"}
                                    </CardTitle>
                                    <CardDescription>
                                        {isExpired
                                            ? "This signing invitation has expired for security reasons."
                                            : "The link you followed is invalid or has already been used."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                                        <AlertTitle>Notice</AlertTitle>
                                        <AlertDescription className="text-xs opacity-90">
                                            {isExpired
                                                ? `Invitation Link is no longer valid.`
                                                : error}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/")}>
                                        <Home className="h-4 w-4" />
                                        Back to Home
                                    </Button>
                                </CardFooter>
                            </>
                        ) : isSuccess ? (
                            <>
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 bg-linear-to-br from-green-400/20 to-emerald-500/20 shadow-inner">
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-linear-to-br from-green-600 to-emerald-700 bg-clip-text text-transparent">Document Signed</CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Successfully finalized.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-500/10 text-center shadow-sm">
                                        <p className="text-sm text-green-700 dark:text-green-400 font-bold">Verification ID</p>
                                        <p className="text-[10px] text-green-600/60 font-mono mt-1 break-all uppercase tracking-tight">{token}</p>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
                                            The document owner has been notified. You can now download your document.
                                        </p>
                                        <Button
                                            asChild
                                            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                                        >
                                            <a href={`${import.meta.env.VITE_API_BASE_URL}/api/documents/${token}/view?type=signed&email=${email}`} download>
                                                Download Signed Document
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                                        Close Portal
                                    </Button>
                                </CardFooter>
                            </>
                        ) : (
                            <>
                                <CardHeader className="text-center pb-2">
                                    <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 rotate-3 ring-1 shadow-sm ${data?.status === "signed" ? "bg-green-500/10 ring-green-500/20" : "bg-amber-500/10 ring-amber-500/20"}`}>
                                        {data?.status === "signed" ? (
                                            <ShieldCheck className="h-7 w-7 text-green-600 -rotate-3" />
                                        ) : (
                                            <Mail className="h-7 w-7 text-amber-600 -rotate-3" />
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        {data?.status === "signed" ? "Signed Document" : "Sign Invitation"}
                                    </CardTitle>
                                    <CardDescription className={`text-base font-medium ${data?.status === "signed" ? "text-green-600/80" : "text-amber-600/80"}`}>
                                        {showForm ? "Identity Verified" : (data?.status === "signed" ? "Document is already signed" : "Review and sign securely")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4">
                                    {!showForm ? (
                                        <div className="space-y-5">
                                            <div className="space-y-4">
                                                <div className={`flex items-center justify-between p-4 rounded-xl border ${data?.status === "signed" ? "bg-green-50 dark:bg-green-950/10 border-green-200/50 dark:border-green-500/10" : "bg-amber-50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-500/10"}`}>
                                                    <div className="space-y-1">
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${data?.status === "signed" ? "text-green-600/80" : "text-amber-600/80"}`}>
                                                            {data?.status === "signed" ? "Signer Identity" : "Expected Signature"}
                                                        </p>
                                                        <p className={`text-sm font-bold ${data?.status === "signed" ? "text-green-900 dark:text-green-100" : "text-amber-900 dark:text-amber-100"}`}>
                                                            {data?.emailHint}
                                                        </p>
                                                    </div>
                                                    {data?.status === "signed" ? (
                                                        <ShieldCheck className="h-5 w-5 text-green-500/40" />
                                                    ) : (
                                                        <Mail className="h-5 w-5 text-amber-500/40" />
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="email-init" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                                        Confirm Your Email
                                                    </label>
                                                    <input
                                                        id="email-init"
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="you@example.com"
                                                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-base font-medium shadow-inner"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Expires At</p>
                                                        <p className="text-xs font-bold">
                                                            {data?.expiresAt ? format(new Date(data.expiresAt), "PPP p") : "N/A"}
                                                        </p>
                                                    </div>
                                                    <Calendar className="h-4 w-4 text-muted-foreground/30" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/10 border border-green-200/50 dark:border-green-500/10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">Verified Signer</p>
                                                    <p className="text-sm font-bold text-green-900 dark:text-green-100">{email}</p>
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 text-green-500/40" />
                                            </div>
                                            <p className="text-xs text-muted-foreground text-center">
                                                Review the document on the left before finalizing your signature.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 pt-2">
                                    {finalizeError && (
                                        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-2 rounded-xl">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs font-semibold">
                                                {finalizeError}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {!showForm ? (
                                        <Button
                                            className="w-full h-12 gap-2 text-base font-bold shadow-lg bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
                                            onClick={async () => {
                                                if (!email.trim()) return

                                                if (data.status === "signed") {
                                                    try {
                                                        setSubmitting(true)
                                                        setFinalizeError(null)
                                                        await getPublicSignature(token, email)
                                                        setShowForm(true)
                                                        setIsSuccess(true)
                                                    } catch (err) {
                                                        console.error("Failed to verify identity:", err)
                                                        setFinalizeError(err.message || "Email verification failed. Please check your email and try again.")
                                                    } finally {
                                                        setSubmitting(false)
                                                    }
                                                } else {
                                                    setShowForm(true)
                                                }
                                            }}
                                            disabled={!email.trim() || submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    {isSuccess ? "View Signed Document" : "Review Document"}
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleFinalize}
                                            disabled={submitting || !email}
                                            className="w-full h-12 gap-2 text-base font-bold shadow-lg bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Finalizing...
                                                </>
                                            ) : (
                                                <>
                                                    Sign Securely
                                                    <ShieldCheck className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <p className="text-[10px] text-center text-muted-foreground px-4 font-medium opacity-60">
                                        Identity verification is required for tamper-proof signatures.
                                    </p>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                </aside>
            </main>

            <footer className="mt-auto pt-12 pb-8 text-muted-foreground/40 text-[11px] flex items-center gap-4 relative z-10 font-medium">
                <span>&copy; 2026 Trace Signature Portal.</span>
                <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                <span className="hover:text-amber-600 transition-colors cursor-pointer">Security Protocol 2.4.0</span>
            </footer>
        </div>
    )
}

export default PublicSign
