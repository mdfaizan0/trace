import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { signin } from "@/api/auth.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react"

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (error) setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const response = await signin(formData)
            if (response?.user?.token) {
                localStorage.setItem("trace_token", response.user.token)
                navigate("/dashboard")
            } else {
                setError("Invalid response from server")
            }
        } catch (err) {
            setError(err.message || "Failed to sign in")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-background font-sans">
            {/* Left side: Branding / Info */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex flex-col justify-between w-[45%] p-16 bg-muted border-r border-border"
            >
                <div className="flex items-center gap-2.5 text-primary font-bold text-2xl tracking-tight">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span>Trace</span>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-5xl font-bold text-foreground leading-[1.15]"
                        >
                            The intelligent way to <span className="text-primary italic">sign</span> documents.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-lg text-muted-foreground max-w-md leading-relaxed"
                        >
                            Enterprise-grade digital signatures with zero friction. Secure, fast, and fully compliant with global standards.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col gap-6"
                    >
                        {[
                            "Legally binding signatures",
                            "Advanced encryption protection",
                            "Audit trails for every action"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <span className="text-sm font-medium text-foreground/80">{text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="text-muted-foreground/60 text-xs font-medium">
                    POWERED BY TRUST & TECHNOLOGY
                </div>
            </motion.div>

            {/* Right side: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[420px]"
                >
                    <div className="lg:hidden flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-12">
                        <ShieldCheck className="h-8 w-8" />
                        <span>Trace</span>
                    </div>

                    <div className="space-y-2 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your secure workplace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                            >
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                                    <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        Password
                                    </Label>
                                    <Link
                                        to="#"
                                        className="text-xs font-medium text-primary hover:underline transition-all"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="bg-border/40" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-background px-4 text-muted-foreground/40">
                                    Secure Access
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            New to Trace?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Login
