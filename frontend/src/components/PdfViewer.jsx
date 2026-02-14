import { useState, useRef, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfViewer({ fileUrl }) {
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pageWidth, setPageWidth] = useState(600)
    const containerRef = useRef(null)

    // Handle responsive page width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Subtract padding: 48px (p-6) * 2 sides is approx replacement
                // Let's just take generic width minus a safe margin
                setPageWidth(containerRef.current.offsetWidth - 48)
            }
        }

        // Initial set
        updateWidth()

        // Resize observer would be better, but window resize is OK for now
        window.addEventListener("resize", updateWidth)
        return () => window.removeEventListener("resize", updateWidth)
    }, [])

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages)
        setLoading(false)
        setError(null)
    }

    function onDocumentLoadError(err) {
        console.error("PDF Load Error:", err)
        setError("Failed to load PDF document.")
        setLoading(false)
    }

    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1))
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))

    // Prepare auth headers
    const token = localStorage.getItem("trace_token")
    const options = useMemo(() => ({
        httpHeaders: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }), [token])

    return (
        <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center min-h-[500px]" ref={containerRef}>
                {error ? (
                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 my-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <div className={`relative w-full flex justify-center ${loading ? "min-h-[400px]" : ""}`}>
                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-background/50 backdrop-blur-[1px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground font-medium">Loading Document...</p>
                                </div>
                            )}

                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                onLoadProgress={() => setLoading(true)}
                                loading={<div className="h-[600px] w-full" />}
                                options={options}
                                className="border border-border/40 shadow-sm rounded-sm overflow-hidden"
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    width={pageWidth}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="bg-white"
                                    loading=""
                                />
                            </Document>
                        </div>

                        {/* Pagination Controls */}
                        {!loading && !error && numPages && (
                            <div className="flex items-center gap-4 mt-6 p-2 rounded-full border border-border bg-muted/30 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="text-sm font-medium tabular-nums px-2 text-muted-foreground">
                                    Page <span className="text-foreground">{pageNumber}</span> of <span className="text-foreground">{numPages}</span>
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
