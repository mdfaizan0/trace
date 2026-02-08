import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header is required" });
    }

    const token = authHeader.split("Bearer ")[1]
    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }
    try {
        const decodedToken = verifyToken(token)
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorized or invalid token" });
        }

        req.user = { id: decodedToken.id }
        next()
    } catch (error) {
        console.error("Error verifying token:", error)
        return res.status(401).json({ message: "Unauthorized or invalid token", error: error.message });
    }
}