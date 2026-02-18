/**
 * Logo Component
 * 
 * Renders the custom Trace brand identity as an SVG.
 * Supports className for easy scaling and styling.
 */
function Logo({ className = "h-6 w-6", showBackground = false }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className={className}
        >
            {showBackground && (
                <rect width="200" height="200" rx="48" fill="#0F172A" />
            )}

            <g transform={showBackground ? "" : "scale(0.9) translate(10, 10)"}>
                <path
                    d="M65 60V130C65 145 75 155 90 155H130"
                    stroke="#6366F1"
                    strokeWidth="20"
                    strokeLinecap="round"
                    fill="none"
                />

                <path
                    d="M55 90H115"
                    stroke="#818CF8"
                    strokeWidth="20"
                    strokeLinecap="round"
                    fill="none"
                />

                <circle cx="135" cy="155" r="14" fill="#34D399" />
            </g>
        </svg>
    )
}

export default Logo
