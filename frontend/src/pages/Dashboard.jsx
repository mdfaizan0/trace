import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePlus, Clock, CheckCircle2 } from "lucide-react"
import UploadDocument from "@/components/UploadDocument"
import DocumentList from "@/components/DocumentList"
import { getAllDocuments } from "@/api/document.api"

function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [documents, setDocuments] = useState([])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAllDocuments()
                setDocuments(response.documents || [])
            } catch (err) {
                console.error("Failed to fetch documents for stats:", err)
            }
        }
        fetchStats()
    }, [refreshKey])

    const stats = [
        {
            label: "Active Requests",
            value: documents.filter(d => d.status !== 'signed').length.toString(),
            icon: Clock,
            color: "text-amber-500"
        },
        {
            label: "Completed",
            value: documents.filter(d => d.status === 'signed').length.toString(),
            icon: CheckCircle2,
            color: "text-emerald-500"
        },
        {
            label: "Total Files",
            value: documents.length.toString(),
            icon: FilePlus,
            color: "text-blue-500"
        },
    ]

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Manage your documents and track signature progress.
                    </p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <UploadDocument onUploadSuccess={() => setRefreshKey((k) => k + 1)} />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full opacity-60 rounded-full ${stat.color.replace('text', 'bg')
                                            }`}
                                        style={{ width: '40%' }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <DocumentList refreshTrigger={refreshKey} />
            </motion.div>
        </div>
    )
}

export default Dashboard

