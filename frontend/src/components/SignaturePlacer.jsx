import { useRef, useState } from "react"
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Save, Loader2, X, UserSearch } from "lucide-react"
import { createInternalSignature, createPublicSignature } from "../api/signature.api"
import { Alert, AlertDescription } from "@/components/ui/alert"

function DraggableSignature({ position, isSaving, onSave, onCancel, signerEmail }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: "signature-placeholder",
    })

    // Calculate base styles
    // If we are dragging, we rely on transform. If dropped, we use position.
    // We render at 'position' always, and dnd-kit adds transform delta.
    const style = {
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`z-50 group`}
        >
            {/* Contextual Action Toolbar - Positioned above */}
            {/* preventDefault/stopPropagation on pointer down to avoid dragging when clicking buttons */}
            <div
                className={`
                    absolute -top-12 left-0 right-0 flex justify-center gap-1
                    card shadow-sm border bg-popover/95 backdrop-blur text-popover-foreground rounded-md p-1
                    transition-opacity duration-200
                    ${isDragging ? "opacity-0" : "opacity-100"}
                `}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSave}
                    disabled={isSaving}
                    className="h-7 px-2 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/20"
                >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                </Button>
                <div className="w-px bg-border my-1" />
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Signature Box */}
            <div className={`
                w-48 h-16 border-2 border-dashed rounded-md flex flex-col items-center justify-center 
                transition-all duration-200 cursor-move shadow-sm
                ${isDragging
                    ? (signerEmail ? "border-amber-500 bg-amber-500/10 scale-105 shadow-xl ring-2 ring-amber-500/20" : "border-primary bg-primary/10 scale-105 shadow-xl ring-2 ring-primary/20")
                    : (signerEmail ? "border-amber-500/60 bg-white/50 hover:border-amber-500 hover:bg-amber-500/5" : "border-primary/60 bg-white/50 hover:border-primary hover:bg-primary/5")
                }
                ${isSaving ? "opacity-50 pointer-events-none" : ""}
            `}>
                <span className={`text-sm font-bold select-none flex items-center gap-2 ${signerEmail ? "text-amber-600" : "text-primary/80"}`}>
                    {signerEmail ? <UserSearch className="h-4 w-4" /> : <Save className="h-4 w-4 opacity-50" />}
                    {signerEmail ? "Signer Here" : "Sign Here"}
                </span>
                {signerEmail && (
                    <span className="text-[10px] font-medium text-amber-500/80 truncate max-w-full px-2">
                        For: {signerEmail}
                    </span>
                )}
            </div>
        </div>
    )
}

export default function SignaturePlacer({ documentId, pageNumber, onSuccess, onCancel, signerEmail }) {
    const [position, setPosition] = useState(null) // { x: 0, y: 0 } relative to container
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const wrapperRef = useRef(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const handleInitialClick = (e) => {
        if (!wrapperRef.current) return

        const rect = wrapperRef.current.getBoundingClientRect()
        // Center the 192x64 box around the click
        const width = 192
        const height = 64

        const relativeX = e.clientX - rect.left - (width / 2)
        const relativeY = e.clientY - rect.top - (height / 2)

        // Clamp to bounds
        const clampedX = Math.max(0, Math.min(relativeX, rect.width - width))
        const clampedY = Math.max(0, Math.min(relativeY, rect.height - height))

        setPosition({ x: clampedX, y: clampedY })
    }

    const handleDragEnd = (event) => {
        if (!wrapperRef.current) return

        const containerRect = wrapperRef.current.getBoundingClientRect()
        const draggableNode = event.active.rect.current.translated

        if (!draggableNode) return

        const relativeX = draggableNode.left - containerRect.left
        const relativeY = draggableNode.top - containerRect.top

        const width = 192
        const height = 64

        const clampedX = Math.max(0, Math.min(relativeX, containerRect.width - width))
        const clampedY = Math.max(0, Math.min(relativeY, containerRect.height - height))

        setPosition({ x: clampedX, y: clampedY })
    }

    const handleSave = async () => {
        if (!wrapperRef.current || !position) return

        setIsSaving(true)
        setError(null)

        const containerRect = wrapperRef.current.getBoundingClientRect()
        const xPercent = (position.x / containerRect.width) * 100
        const yPercent = (position.y / containerRect.height) * 100

        try {
            if (signerEmail) {
                await createPublicSignature({
                    documentId,
                    pageNumber,
                    xPercent,
                    yPercent,
                    signerEmail
                })
            } else {
                await createInternalSignature({
                    documentId,
                    pageNumber,
                    xPercent,
                    yPercent
                })
            }
            if (onSuccess) onSuccess()
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || "Failed to save signature placeholder")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div ref={wrapperRef} className="absolute inset-0 z-40">
            {error && (
                <div className="absolute top-4 right-4 z-50 w-64 pointer-events-auto">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {!position ? (
                // Click-to-Place Layer
                <div
                    className="absolute inset-0 z-50 cursor-crosshair hover:bg-primary/5 transition-colors"
                    onClick={handleInitialClick}
                    title={signerEmail ? `Click to place signature for ${signerEmail}` : "Click to place your signature"}
                >
                    {/* Optional: Follow cursor with ghost preview? For now, just crosshair. */}
                </div>
            ) : (
                // Draggable Layer
                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToParentElement]}
                    onDragEnd={handleDragEnd}
                >
                    <div className="absolute inset-0 pointer-events-auto">
                        <DraggableSignature
                            position={position}
                            isSaving={isSaving}
                            onSave={handleSave}
                            onCancel={onCancel}
                            signerEmail={signerEmail}
                        />
                    </div>
                </DndContext>
            )}
        </div>
    )
}
