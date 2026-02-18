import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/Logo"
import { ArrowRight, LayoutDashboard, Home, SearchX, ShieldCheck } from "lucide-react"

function NotFound() {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden selection:bg-primary/20">
            {/* PROFESSIONAL BACKDROP: Subtle Grid & Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-60" />
            </div>

            {/* CINEMATIC ELEMENTS */}
            <main className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-12"
                >
                    {/* LARGE STYLIZED 404 */}
                    <div className="relative">
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.05 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            className="text-[200px] md:text-[350px] font-black tracking-tighter leading-none select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                            404
                        </motion.h1>

                        <div className="relative z-20 flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="h-20 w-20 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-2xl backdrop-blur-sm mb-8"
                            >
                                <SearchX className="h-10 w-10" />
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                                Lost in <span className="text-primary italic">Trace</span>.
                            </h2>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-medium">
                        The document or state you are tracking doesn't seem to exist. Let's get you back on course.
                    </p>

                    {/* NAVIGATION NODES */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <motion.div whileHover={{ y: -4 }}>
                            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-xl shadow-primary/20 active:scale-[0.98]" asChild>
                                <Link to="/dashboard">
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    Account Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ y: -4 }}>
                            <Button size="lg" variant="ghost" className="h-14 px-10 text-base font-bold hover:bg-muted/50 transition-all border border-transparent hover:border-border/40" asChild>
                                <Link to="/">
                                    <Home className="mr-2 h-5 w-5 opacity-70" />
                                    Return to Home
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* BOTTOM BRANDING */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="mt-24 pt-8 border-t border-border/20 w-full max-w-xs"
                >
                    <div className="flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                        <Logo className="h-4 w-4 grayscale opacity-70" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">Trace Integrity Console</span>
                    </div>
                </motion.div>
            </main>

            {/* SUBTLE SCANNING LINE ANIMATION */}
            <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-px bg-primary/10 blur-[1px] pointer-events-none z-0"
            />
        </div>
    )
}

export default NotFound