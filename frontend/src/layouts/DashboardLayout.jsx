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
    User,
    Sun,
    Moon
} from "lucide-react"
import { getMyProfile, logout } from "@/api/auth.api"
import { useTheme } from "@/hooks/theme/useTheme"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Documents", icon: FileText, href: "/documents" },
]

function DashboardLayout() {
    const [user, setUser] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout(navigate)
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
                localStorage.setItem("trace_user", JSON.stringify(data.user))
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
                        <h2 className="text-sm font-semibold tracking-tight text-foreground/90 sm:text-base">
                            {NAV_ITEMS.find(item => isActive(item.href))?.label || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-secondary hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 rounded-full h-10 w-10 border border-transparent hover:border-white/20">
                                    <Bell className="h-[1.15rem] w-[1.15rem]" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                                <p>Notifications</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-secondary hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 rounded-full h-10 w-10 border border-transparent hover:border-white/20"
                                    onClick={toggleTheme}
                                >
                                    {theme === "dark" ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                                <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                            </TooltipContent>
                        </Tooltip>

                        <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block opacity-30" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2.5 p-2 h-10 rounded-full hover:bg-accent/20 transition-all border border-transparent hover:border-border/40 group">
                                    <div className="hidden md:block text-right px-1">
                                        <p className="text-[13px] font-medium text-foreground/90 leading-none group-hover:text-foreground transition-colors">{user?.name || "User"}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide">FREE PLAN</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs group-hover:shadow-xs transition-shadow overflow-hidden">
                                        {user?.name ? (
                                            <span className="text-xs font-bold uppercase tracking-tighter">{user.name.charAt(0)}</span>
                                        ) : (
                                            <User className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 shadow-lg border-border/40">
                                <DropdownMenuLabel className="font-normal p-3">
                                    <div className="flex flex-col space-y-1.5">
                                        <p className="text-sm font-semibold leading-none">{user?.name || "User"}</p>
                                        <p className="text-[11px] leading-none text-muted-foreground truncate opacity-80">{user?.email || "user@example.com"}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="opacity-50" />
                                <DropdownMenuItem className="cursor-pointer py-2.5">
                                    <User className="mr-2.5 h-4 w-4 opacity-70" />
                                    <span className="text-xs font-medium">Profile Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5">
                                    <Bell className="mr-2.5 h-4 w-4 opacity-70" />
                                    <span className="text-xs font-medium">Notifications</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="opacity-50" />
                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive py-2.5" onClick={handleLogout}>
                                    <LogOut className="mr-2.5 h-4 w-4 opacity-70" />
                                    <span className="text-xs font-semibold">Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
