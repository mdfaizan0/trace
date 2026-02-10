export function maskEmail(email) {
    if (!email) {
        throw new Error("Email is required")
    }
    const [username, domain] = email.split("@")
    const firstChar = username[0]
    const lastChar = username[username.length - 1]
    const maskedChars = '*'.repeat(username.length - 2)
    return `${firstChar}${maskedChars}${lastChar}@${domain}`
}