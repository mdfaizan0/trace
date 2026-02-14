import { useEffect, useState } from "react"
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    LayoutDashboard,
    FileText,
    LogOut,
    ShieldCheck,
    Menu,
    X,
    Bell,
    User
} from "lucide-react"
import { getMyProfile } from "@/api/auth.api"

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Documents", icon: FileText, href: "/documents" },
]

function DashboardLayout() {
    const [user, setUser] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem("trace_token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    useEffect(() => {
        const existingUser = localStorage.getItem("user")
        if (existingUser) {
            setUser(JSON.parse(existingUser))
            return
        }
        async function getUser() {
            const data = await getMyProfile()
            if (data) {
                setUser(data.user)
                localStorage.setItem("user", JSON.stringify(data.user))
            }
        }
        getUser()
    }, [])

    const isActive = (href) => location.pathname === href

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background border-r border-border p-6">
            <div className="flex items-center gap-2 mb-10 px-2 text-primary font-bold text-xl">
                <ShieldCheck className="h-6 w-6" />
                <span>Trace</span>
            </div>

            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <Button
                        key={item.href}
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-3 h-11 px-3 ${isActive(item.href) ? "font-semibold" : "text-muted-foreground"
                            }`}
                        asChild
                    >
                        <Link to={item.href}>
                            <item.icon className={`h-4 w-4 ${isActive(item.href) ? "text-primary" : ""}`} />
                            {item.label}
                        </Link>
                    </Button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-border/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive h-11 px-3"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="hidden lg:block w-64 fixed inset-y-0 h-full z-30"
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-background z-50 lg:hidden shadow-xl"
                        >
                            <div className="absolute right-4 top-4">
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col">
                {/* Topbar */}
                <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                            {NAV_ITEMS.find(item => isActive(item.href))?.label || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1 md:mx-2 hidden sm:block" />
                        <div className="flex items-center gap-2 pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-semibold text-foreground leading-none">{user?.name || "User"}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Free Plan</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground overflow-hidden">
                                <User className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
