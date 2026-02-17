import React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // Check if it's a backend error with a custom message
            const errorMessage = this.state.error?.response?.data?.message
                || this.state.error?.message
                || "An unexpected runtime error occurred."

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
                    <Card className="max-w-md w-full shadow-2xl border-destructive/20 ring-1 ring-destructive/10 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 text-destructive">
                                <AlertCircle className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4 pt-2">
                            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    {errorMessage}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                Our engineers have been notified. Please try refreshing the page or contact support if the problem persists.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                            <Button
                                variant="outline"
                                className="w-full gap-2 font-semibold"
                                onClick={() => window.location.href = "/"}
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                            <Button
                                className="w-full gap-2 font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Reload App
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
