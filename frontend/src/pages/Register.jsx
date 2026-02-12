import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { signup } from "@/api/auth.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Loader2, UserPlus } from "lucide-react"

function Register() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
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
            await signup(formData)
            setSuccess(true)
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (err) {
            setError(err.message || "Failed to sign up")
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
                            Start signing <span className="text-primary italic">smarter</span> today.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-lg text-muted-foreground max-w-md leading-relaxed"
                        >
                            Join thousands of teams who trust Trace for their most critical legal documents.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col gap-6"
                    >
                        {[
                            "Set up in less than 2 minutes",
                            "Unlimited signature workflows",
                            "Integrated document management"
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
                    EMPOWERING DIGITAL TRUST
                </div>
            </motion.div>

            {/* Right side: Signup Form */}
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
                        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground">
                            Sign up today and get started with Trace for free.
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Alert className="bg-primary/5 border-primary/20 text-primary p-6">
                                <AlertDescription className="text-sm font-medium flex flex-col items-center gap-2 text-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Account created successfully! <br />
                                    Redirecting to login...
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    ) : (
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
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
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
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        Password
                                    </Label>
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Sign up
                                        <UserPlus className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="bg-border/40" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-background px-4 text-muted-foreground/40">
                                    New Joiner
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Register
