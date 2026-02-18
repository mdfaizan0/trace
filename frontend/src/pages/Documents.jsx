import { useState } from "react"
import DocumentList from "@/components/DocumentList"
import { FileText, Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

function Documents() {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest")
    const [statusFilter, setStatusFilter] = useState("all")

    const getSortLabel = (val) => {
        switch (val) {
            case "newest": return "Newest First"
            case "oldest": return "Oldest First"
            case "name_az": return "Name (A-Z)"
            case "name_za": return "Name (Z-A)"
            default: return "Sort By"
        }
    }

    const getStatusLabel = (val) => {
        switch (val) {
            case "all": return "All Status"
            case "signed": return "Signed"
            case "pending": return "Pending"
            case "ready_to_sign": return "Ready to Sign"
            default: return "Status"
        }
    }
    return (
        <div className="space-y-10 pb-12">
            {/* CONSISTENT HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary/40" />
                        Documents
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-lg leading-relaxed">
                        Access and manage your complete digital asset historical record.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search assets..."
                            className="pl-10 h-10 bg-background border-border/40 focus:border-primary/40 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 border-border/40 gap-2 font-medium">
                                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="hidden xs:inline text-xs">{getSortLabel(sortBy)}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs">Sort Orders</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                    <DropdownMenuRadioItem value="newest" className="text-xs">Newest First</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="oldest" className="text-xs">Oldest First</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_az" className="text-xs">Name (A-Z)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_za" className="text-xs">Name (Z-A)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 border-border/40 gap-2 font-medium">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="hidden xs:inline text-xs">{getStatusLabel(statusFilter)}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs">Filter Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                    <DropdownMenuRadioItem value="all" className="text-xs">All Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="signed" className="text-xs">Signed</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="pending" className="text-xs">Pending</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="ready_to_sign" className="text-xs">Ready to Sign</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DocumentList
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    statusFilter={statusFilter}
                />
            </motion.div>
        </div>
    )
}

export default Documents
