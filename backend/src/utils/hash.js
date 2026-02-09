import bcrypt from "bcryptjs"
import crypto from "crypto"

export function hashPassword(password) {
    return bcrypt.hash(password, 10)
}

export function comparePassword(password, hash) {
    return bcrypt.compare(password, hash)
}

export function generateFileHash(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("Buffer is required")
    }
    return crypto.createHash("sha256").update(buffer).digest("hex")
}

export function checkFileHash(buffer, hash) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("Buffer is required")
    }
    if (!hash) {
        throw new Error("Hash is required")
    }
    return crypto.createHash("sha256").update(buffer).digest("hex") === hash
}