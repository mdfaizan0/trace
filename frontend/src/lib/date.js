/**
 * Formats a date string into a professional human-readable format.
 * Format: "Feb 16, 2026 · 15:04 UTC"
 */
export function formatDate(dateString) {
    if (!dateString) return "N/A"

    try {
        const date = new Date(dateString)

        // Use Intl.DateTimeFormat for professional formatting
        const formatter = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        })

        const parts = formatter.formatToParts(date)
        const getPart = (type) => parts.find(p => p.type === type)?.value

        return `${getPart('month')} ${getPart('day')}, ${getPart('year')} · ${getPart('hour')}:${getPart('minute')} UTC`
    } catch (error) {
        console.error("Date formatting error:", error)
        return dateString
    }
}
