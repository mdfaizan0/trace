import { BadgeCheck, User2, Link2, Copy, Check } from "lucide-react"
import { useState } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default function SavedSignature({ signature, type = "internal", showPopover = false }) {
    const [copied, setCopied] = useState(false)
    if (!signature) return null

    const isPublic = type === "public"
    const x = signature.xPercent ?? signature.x_percent
    const y = signature.yPercent ?? signature.y_percent
    const pageNum = signature.pageNumber ?? signature.page_number
    const emailHint = signature.emailHint ?? signature.signer_email_hint
    const signerRef = signature.token ?? signature.signer_ref

    const signLink = `${window.location.origin}/sign/public/${signerRef}`

    const handleCopy = async (e) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(signLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy link", err)
        }
    }

    const content = (
        <div className={`
            relative w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center overflow-hidden 
            ${isPublic
                ? "border-amber-500/60 bg-amber-500/5 shadow-amber-500/10 cursor-pointer"
                : "border-primary/60 bg-primary/5 shadow-primary/10 cursor-not-allowed"
            }
        `}>
            {/* Enhanced Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full -skew-x-12 animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent dark:via-white/20" />

            <div className={`
                flex items-center gap-2 font-semibold bg-white/50 px-3 py-1 rounded backdrop-blur-sm shadow-sm ring-1 ring-black/5 z-10
                ${isPublic ? "text-amber-600" : "text-primary"}
            `}>
                {isPublic ? <User2 className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                <span className="text-xs">{isPublic ? "External Signer" : "Your Signature"}</span>
            </div>

            {isPublic && emailHint && (
                <div className="text-[10px] font-medium text-amber-500/80 z-10 mt-1 truncate max-w-full px-2">
                    {emailHint}
                </div>
            )}
        </div>
    )

    return (
        <div
            className={`absolute z-30 group ${(!isPublic || !showPopover) ? "pointer-events-none" : "pointer-events-auto"}`}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 192,
                height: 64,
            }}
        >
            {isPublic && showPopover ? (
                <Popover>
                    <PopoverTrigger asChild>
                        {content}
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="center" side="top">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-600 mb-1">
                                <Link2 className="h-4 w-4" />
                                <h4 className="text-sm font-bold">Signing Link</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Copy and share this link with the signer ({signature.signer_email_hint}). They will need to verify their email to sign.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-muted/50 rounded-md px-2 py-1.5 border truncate text-[10px] font-mono select-all">
                                    {signLink}
                                </div>
                                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            ) : content}
        </div>
    )
}
