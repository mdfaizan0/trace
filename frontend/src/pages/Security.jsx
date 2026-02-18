import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Lock,
    Activity,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Database,
    Zap,
    Scale
} from "lucide-react"
import Logo from "@/components/ui/Logo"

function Security() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* NAVIGATION HEADER */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 text-primary font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                        <div className="bg-primary text-primary-foreground p-1 rounded-lg shadow-sm">
                            <Logo className="h-6 w-6 brightness-0 invert" />
                        </div>
                        <span>Trace</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-sm font-medium" asChild>
                            <Link to="/">Back to Home</Link>
                        </Button>
                        <Button className="font-semibold shadow-sm px-5" asChild>
                            <Link to="/register">Join Now</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 bg-primary/5">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest"
                        >
                            <Lock className="h-3 w-3" />
                            Enterprise-Grade Security
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
                        >
                            Security that moves at the speed of <span className="text-primary italic">trust</span>.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
                        >
                            We prioritize the integrity of your digital assets. Trace combines modern cryptographic themes with industrial-strength infrastructure.
                        </motion.p>
                    </div>
                </section>

                {/* CORE PILLARS */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight">Our Security Architecture</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Every document in Trace is treated with absolute priority. We ensure that once a signature is applied, it remains valid and verifiable for the life of the asset.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    {
                                        title: "Data Encryption",
                                        desc: "All document metadata and signatures are stored with modern encryption protocols, ensuring zero-unauthorized access.",
                                        icon: Lock
                                    },
                                    {
                                        title: "Immutable History",
                                        desc: "The audit trail is append-only. No action can be deleted or altered once it is committed to the platform.",
                                        icon: Activity
                                    },
                                    {
                                        title: "Token-Based Privacy",
                                        desc: "Public sharing links are secured by unique, high-entropy tokens that expire upon document finalization.",
                                        icon: Zap
                                    }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-foreground">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* VISUAL REPRESENTATION */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative lg:pl-12"
                        >
                            <Card className="border-border/40 shadow-xl overflow-hidden bg-muted/20 backdrop-blur-sm">
                                <CardHeader className="border-b border-border/40 pb-6 bg-background/50">
                                    <div className="flex items-center justify-between uppercase tracking-widest text-[10px] font-bold text-muted-foreground opacity-60">
                                        <span>Security System Protocol</span>
                                        <Activity className="h-3 w-3 animate-pulse text-emerald-500" />
                                    </div>
                                    <CardTitle className="text-lg pt-4 flex items-center gap-2">
                                        <Database className="h-4 w-4 text-primary" />
                                        Storage Infrastructure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Supabase PostgreSQL</span>
                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Operational</Badge>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "100%" }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-2">
                                            <Scale className="h-4 w-4 text-secondary" />
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Compliance</p>
                                            <p className="font-bold text-sm leading-tight text-foreground">Audit Ready</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Validation</p>
                                            <p className="font-bold text-sm leading-tight text-foreground">Verified State</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/40">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                                            <Logo className="h-4 w-4" />
                                            <p className="text-[11px] font-medium text-muted-foreground">
                                                Trace implements active integrity checks on all storage buckets.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* BOTTOM CTA */}
                <section className="py-24 px-6 border-t border-border/40 bg-muted/30">
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trust is our only currency.</h2>
                            <p className="text-muted-foreground text-lg italic">
                                Ready to experience the future of secure document management?
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-lg" asChild>
                                <Link to="/register">Create Your Account</Link>
                            </Button>
                            <Button size="lg" variant="ghost" className="h-14 px-10 text-base font-bold" asChild>
                                <Link to="/">Return Home</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-12 px-6 border-t border-border/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2.5 text-primary font-bold text-lg opacity-80">
                        <Logo className="h-5 w-5" />
                        <span>Trace</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center">
                        © 2026 Trace Technologies. Security Core v1.0
                    </p>
                    <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="#" className="hover:text-primary transition-colors">Documentation</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Security
