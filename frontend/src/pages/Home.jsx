import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/Logo"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ShieldCheck,
    ArrowRight,
    Lock,
    FileText,
    Activity,
    CheckCircle2,
    Clock,
    Github,
    Twitter,
    Sun,
    Moon
} from "lucide-react"
import { useTheme } from "@/hooks/theme/useTheme"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function Home() {
    const { theme, toggleTheme } = useTheme()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("trace_token")
        setIsAuthenticated(!!token)
        setLoading(false)
    }, [])
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* NAVIGATION HEADER */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-primary font-bold text-xl tracking-tight">
                        <Logo className="h-8 w-8" />
                        <span>Trace</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/security" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Security</Link>
                        <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Documentation</Link>

                        <div className="w-px h-4 bg-border/40 mx-2" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg h-9 w-9 border border-transparent hover:border-border/40"
                                    onClick={toggleTheme}
                                >
                                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                                <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </nav>

                    <div className="flex items-center gap-4">
                        {!loading && (
                            isAuthenticated ? (
                                <Button className="font-semibold shadow-lg shadow-primary/20 px-6" asChild>
                                    <Link to="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" className="text-sm font-medium hidden sm:flex" asChild>
                                        <Link to="/login">Sign in</Link>
                                    </Button>
                                    <Button className="font-semibold shadow-sm px-5" asChild>
                                        <Link to="/register">Get Started</Link>
                                    </Button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

                        {/* LEFT COLUMN: TEXT */}
                        <div className="lg:col-span-6 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest mb-6">
                                    Now in Active Beta
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-8">
                                    Digital Asset <span className="text-primary italic">Authentication</span> at Scale.
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                    Trace provides a high-fidelity environment for document signing and verification. Build trust with an immutable ledger of every action.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Button size="lg" className="h-14 px-8 text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" asChild>
                                    <Link to="/register">
                                        Start Signing Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold bg-background/50 backdrop-blur-sm border-border/60 hover:border-primary/40 active:scale-[0.98] transition-all" asChild>
                                    <Link to="/security">Explore Security</Link>
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 1 }}
                                className="flex items-center gap-8 pt-4 filter grayscale opacity-40"
                            >
                                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">Trusted By Leading Teams</div>
                                <div className="h-px w-full bg-border/40" />
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: MOCK PREVIEW */}
                        <div className="lg:col-span-6 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                                className="relative z-10"
                            >
                                {/* MAIN MOCK CARD */}
                                <Card className="border-border/40 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden lg:-rotate-2">
                                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3 rounded-full bg-destructive/40" />
                                                <div className="h-3 w-3 rounded-full bg-secondary/40" />
                                                <div className="h-3 w-3 rounded-full bg-primary/40" />
                                            </div>
                                            <Badge variant="outline" className="text-[9px] bg-background/50">TRACE_AUDIT_STABLE</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1.5">
                                                    <div className="h-4 w-48 bg-foreground/10 rounded-full animate-pulse" />
                                                    <div className="h-3 w-32 bg-foreground/5 rounded-full" />
                                                </div>
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Verified</Badge>
                                            </div>

                                            <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/30 bg-background/40">
                                                        <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <Skeleton className="h-2 w-full max-w-[140px]" />
                                                            <Skeleton className="h-1.5 w-full max-w-[80px]" />
                                                        </div>
                                                        <Activity className="h-3 w-3 text-primary/40" />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold">
                                                            {String.fromCharCode(64 + i)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-8 text-[11px] font-bold uppercase tracking-tight">View Full Ledger</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* FLOATING ELEMENT: SECURITY OVERLAY */}
                                <motion.div
                                    animate={{
                                        y: [0, -12, 0],
                                        rotate: [-2, 1, -2]
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -top-12 -right-12 z-20 hidden sm:block"
                                >
                                    <Card className="p-4 border-primary/20 bg-primary/5 backdrop-blur-md shadow-2xl max-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-primary tracking-widest opacity-80">Encryption</p>
                                                <p className="text-[13px] font-bold text-foreground leading-none">AES-256 Validated</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* FLOATING ELEMENT: STATS */}
                                <motion.div
                                    animate={{
                                        y: [0, 12, 0],
                                        x: [0, 8, 0]
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }}
                                    className="absolute -bottom-10 -left-10 z-20 hidden sm:block"
                                >
                                    <Card className="p-5 border-border/40 bg-background/90 shadow-2xl max-w-[170px] backdrop-blur-sm">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <Activity className="h-4 w-4 text-primary opacity-60" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Uptime</span>
                                            </div>
                                            <div className="text-3xl font-bold tracking-tighter text-primary">99.9%</div>
                                            <p className="text-[10px] font-medium text-muted-foreground leading-none">Real-time Integrity Check</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* BACKGROUND BLURS */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 rounded-full blur-[120px] -z-10" />
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="py-32 px-6 bg-muted/30">
                    <div className="max-w-7xl mx-auto space-y-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-center space-y-4"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built for the modern trust economy.</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                We've combined deep security with intuitive design to create a signing experience your team will actually enjoy using.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Core Functionality",
                                    desc: "Effortless PDF uploads, internal signatures, and secure public signing requests.",
                                    icon: FileText,
                                    color: "text-primary"
                                },
                                {
                                    title: "Premium UX",
                                    desc: "Framer Motion powered transitions, dark mode as a first-class citizen, and responsive layout.",
                                    icon: Activity,
                                    color: "text-secondary"
                                },
                                {
                                    title: "Audit Integrity",
                                    desc: "Every action is logged in an immutable ledger with precise timestamps and participant metadata.",
                                    icon: ShieldCheck,
                                    color: "text-emerald-500"
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="h-full border-border/40 bg-background/60 shadow-sm hover:shadow-md transition-all">
                                        <CardHeader>
                                            <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4 ${feature.color}`}>
                                                <feature.icon className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-32 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-3xl mx-auto space-y-10"
                    >
                        <h2 className="text-3xl md:text-6xl font-bold tracking-tight">Ready to transform your asset verification?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-xl shadow-primary/20 active:scale-[0.98]" asChild>
                                <Link to="/register">Get Started Now</Link>
                            </Button>
                            <Button size="lg" variant="ghost" className="h-14 px-10 text-base font-bold active:scale-[0.98]" asChild>
                                <Link to="/login">Sign in to Account</Link>
                            </Button>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-12 px-6 border-t border-border/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-lg opacity-80">
                            <Logo className="h-6 w-6" />
                            <span>Trace</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            © 2026 Trace Technologies. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Link to="/security" className="hover:text-primary transition-colors">Security</Link>
                        <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
