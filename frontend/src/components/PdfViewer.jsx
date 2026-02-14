import { useState, useRef, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, AlertCircle, Loader2, ChevronsUpDown } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfViewer({ fileUrl, onPageChange, children }) {
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pageWidth, setPageWidth] = useState(600)
    const [jumpPage, setJumpPage] = useState("1")
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const containerRef = useRef(null)

    // Handle responsive page width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Subtract padding: 48px (p-6) * 2 sides + extra buffer (12px) to prevent scrollbar
                setPageWidth(containerRef.current.offsetWidth - 60)
            }
        }

        // Initial set
        updateWidth()

        // Resize observer would be better, but window resize is OK for now
        window.addEventListener("resize", updateWidth)
        return () => window.removeEventListener("resize", updateWidth)
    }, [])

    useEffect(() => {
        if (onPageChange) {
            onPageChange(pageNumber)
        }
        setJumpPage(String(pageNumber))
    }, [pageNumber, onPageChange])

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

    const goToPrevPage = (e) => {
        e.preventDefault()
        setPageNumber((prev) => Math.max(prev - 1, 1))
    }
    const goToNextPage = (e) => {
        e.preventDefault()
        setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
    }

    const handleJumpSubmit = (e) => {
        e.preventDefault()
        const target = parseInt(jumpPage)
        if (target >= 1 && target <= (numPages || 1)) {
            setPageNumber(target)
            setIsPopoverOpen(false)
        }
    }

    const handleGridClick = (page) => {
        setPageNumber(page)
        setIsPopoverOpen(false)
    }

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
                                className="border border-border/40 shadow-sm rounded-sm overflow-hidden relative"
                            >
                                <div style={{ minHeight: pageWidth * 1.41 }}>
                                    <Page
                                        pageNumber={pageNumber}
                                        width={pageWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="bg-white"
                                        loading={<div style={{ height: pageWidth * 1.41 }} className="w-full bg-white animate-pulse" />}
                                    />
                                    {/* Render overlay children (SignaturePlacer) here */}
                                    {!loading && children}
                                </div>
                            </Document>
                        </div>

                        {/* Pagination Controls */}
                        {!loading && !error && numPages && (
                            <div className="flex items-center gap-2 mt-6 p-1 pr-2 rounded-full border border-border bg-muted/30 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-3 font-normal text-muted-foreground hover:text-foreground gap-2"
                                        >
                                            <span className="tabular-nums text-foreground font-medium">Page {pageNumber}</span>
                                            <span className="opacity-50">of {numPages}</span>
                                            <ChevronsUpDown className="h-3 w-3 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3" align="center" side="top">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm leading-none">Go to page</h4>
                                                <form onSubmit={handleJumpSubmit} className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={numPages}
                                                        value={jumpPage}
                                                        onChange={(e) => setJumpPage(e.target.value)}
                                                        className="h-8"
                                                    />
                                                    <Button type="submit" size="sm" className="h-8">Go</Button>
                                                </form>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm leading-none">Quick Jump</h4>
                                                <div className="grid grid-cols-6 gap-1 max-h-[160px] overflow-y-auto p-1 border rounded-md">
                                                    {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            onClick={() => handleGridClick(p)}
                                                            className={`
                                                                text-xs h-7 rounded-sm flex items-center justify-center transition-colors
                                                                ${pageNumber === p ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"}
                                                            `}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
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
