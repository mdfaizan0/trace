import { BadgeCheck } from "lucide-react"

export default function SavedSignature({ signature }) {
    if (!signature) return null

    // Use CSS percentages directly for robust positioning
    // signature.x_percent and signature.y_percent are 0-100 values

    return (
        <div
            className="absolute z-30 pointer-events-none group"
            style={{
                left: `${signature.x_percent}%`,
                top: `${signature.y_percent}%`,
                width: 192,
                height: 64,
            }}
        >
            <div className="relative w-full h-full border-2 border-dashed border-primary/60 bg-primary/5 rounded-md flex items-center justify-center overflow-hidden cursor-not-allowed">
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />

                <div className="flex items-center gap-2 text-primary font-semibold px-3 py-1 rounded bg-background/60 backdrop-blur-sm shadow-sm ring-1 ring-black/5 z-10">
                    <span>Signature Ready</span>
                </div>
            </div>
        </div>
    )
}
