export function maskEmail(email) {
    if (!email) {
        throw new Error("Email is required")
    }
    const [username, domain] = email.split("@")
    const [brand, tld] = domain.split(".")
    const firstChar = username[0]
    const lastChar = username[username.length - 1]
    const maskedChars = '*'.repeat(username.length - 2)
    const maskedBrand = '*'.repeat(brand.length)
    return `${firstChar}${maskedChars}${lastChar}@${maskedBrand}.${tld}`
}