import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Let's trace your documents! ✍🏻")
})

app.get("/health", (req, res) => {
    res.send("OK")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))