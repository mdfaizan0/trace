import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { getAllDocuments } from "@/api/document.api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Clock, CheckCircle2, AlertCircle, Inbox } from "lucide-react"

function DocumentList({ refreshTrigger }) {
    const navigate = useNavigate()
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const response = await getAllDocuments()
            setDocuments(response.documents || [])
            setError("")
        } catch (err) {
            setError(err.message || "Failed to fetch documents")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [refreshTrigger])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "signed":
                return (
                    <Badge className="capitalize font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Signed
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="secondary" className="capitalize font-semibold bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="capitalize">
                        {status || "Unknown"}
                    </Badge>
                )
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Your Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/50 bg-card overflow-hidden">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-5 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Your Documents</h2>
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (documents.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Your Documents</h2>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-border/40 bg-muted/20 text-center"
                >
                    <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
                        <Inbox className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">No documents yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                        Upload your first PDF above to start tracking signature progress here.
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Your Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {documents.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                onClick={() => navigate(`/dashboard/documents/${doc.id}`)}
                                className="group border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98]"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 truncate">
                                        <FileText className="h-4 w-4 text-primary shrink-0" />
                                        <span className="truncate">{doc.title}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Status</span>
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground/60 font-medium">
                                        {formatDate(doc.created_at)}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default DocumentList
