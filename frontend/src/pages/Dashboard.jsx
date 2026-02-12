import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePlus, Clock, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function Dashboard() {
    const stats = [
        { label: "Active Requests", value: "3", icon: Clock, color: "text-amber-500" },
        { label: "Completed", value: "12", icon: CheckCircle2, color: "text-emerald-500" },
        { label: "Total Files", value: "15", icon: FilePlus, color: "text-blue-500" },
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
                <Button className="w-fit shadow-sm hover:shadow-md transition-all active:scale-[0.98] gap-2">
                    <FilePlus className="h-4 w-4" />
                    New Document
                </Button>
            </header>

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
                <Card className="border-border/50 bg-card shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Recent Documents</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">Your latest uploaded files and their status.</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-1">
                                View all <ArrowRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="py-12 text-center">
                        <div className="max-w-[280px] mx-auto space-y-4">
                            <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                                <FilePlus className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">No documents yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ready to get started? Upload your first document for signing.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="font-semibold">
                                Upload File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default Dashboard
