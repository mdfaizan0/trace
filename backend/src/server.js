import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import documentRoutes from "./routes/document.routes.js"
import signatureRoutes from "./routes/signature.routes.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.get("/", (req, res) => {
    res.send("Let's trace your documents! ✍🏻")
})

app.get("/health", (req, res) => {
    res.send("OK")
})

app.use("/api/auth", authRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/signatures", signatureRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))