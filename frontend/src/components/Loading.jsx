import { Loader2 } from "lucide-react"

/**
 * Global Loading Spinner
 * Used as a fallback for Suspense during lazy loading of pages.
 */
function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="relative flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 animate-pulse" />
                <Loader2 className="h-6 w-6 text-primary animate-spin absolute" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase">
                Preparing Trace...
            </p>
        </div>
    )
}

export default Loading
