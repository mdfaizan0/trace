import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export function generateToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
}

export function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
}