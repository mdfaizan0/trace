import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { uploadDocument } from "@/api/document.api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2, X, Upload, Pencil } from "lucide-react"

function UploadDocument({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState("")
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError("")
        setSuccess(false)
        setProgress(0)

        // Handle rejections (validation failed)
        if (rejectedFiles.length > 0) {
            const reason = rejectedFiles[0].errors[0]?.message || "Invalid file"
            if (reason.includes("application/pdf")) {
                setError("Only PDF files are allowed")
            } else {
                setError(reason)
            }
            setFile(null)
            return
        }

        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0]
            setFile(selectedFile)
            // Pre-fill title with filename without extension
            setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: loading || success
    })

    const resetSelection = () => {
        setFile(null)
        setTitle("")
        setError("")
        setSuccess(false)
        setProgress(0)
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError("")
        setSuccess(false)
        setProgress(0)

        const formData = new FormData()
        formData.append("file", file)
        // Use custom title if provided, otherwise fallback to filename
        formData.append("title", title.trim() || file.name.replace(/\.[^/.]+$/, ""))

        try {
            await uploadDocument(formData, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                setProgress(percentCompleted)
            })
            setSuccess(true)
            setFile(null)
            setTitle("")
            onUploadSuccess?.()
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to upload document")
            setProgress(0)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-border/50 bg-card overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-primary" />
                    Upload Document
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                    {!file && !success && (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            {...getRootProps()}
                            className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer 
                                ${isDragActive
                                    ? "border-primary bg-primary/5 scale-[1.01]"
                                    : "border-border/60 hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className={`h-16 w-16 rounded-full bg-background border flex items-center justify-center mb-4 transition-all
                                ${isDragActive ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-border shadow-sm group-hover:scale-110"}
                            `}>
                                {isDragActive ? (
                                    <Upload className="h-8 w-8 text-primary animate-bounce" />
                                ) : (
                                    <FileText className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <h3 className="text-sm font-semibold mb-1">
                                {isDragActive ? "Drop your PDF here" : "Click to select or drag and drop"}
                            </h3>
                            <p className="text-xs text-muted-foreground">PDF files up to 5MB</p>
                        </motion.div>
                    )}

                    {file && !success && (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/80">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!loading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={resetSelection}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2.5"
                            >
                                <Label htmlFor="doc-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Pencil className="h-3 w-3" />
                                    Document Title <span className="text-[10px] font-normal lowercase">(optional)</span>
                                </Label>
                                <Input
                                    id="doc-title"
                                    placeholder="Enter document title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={loading}
                                    className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
                                />
                                <p className="text-[10px] text-muted-foreground italic pl-1">
                                    Default: {file.name.replace(/\.[^/.]+$/, "")}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 flex flex-col items-center justify-center space-y-4 text-center"
                        >
                            <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Upload Complete!</h3>
                                <p className="text-sm text-muted-foreground mt-1">Your document is ready for signing.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSuccess(false)}
                                className="font-semibold"
                            >
                                Upload another
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                    </Alert>
                )}

                {loading && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">Uploading...</span>
                            <span className="font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}

                {file && !loading && !success && (
                    <Button
                        onClick={handleUpload}
                        className="w-full h-11 font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        Confirm and Upload
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default UploadDocument
