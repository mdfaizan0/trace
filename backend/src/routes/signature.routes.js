import express from "express"
import { createSignaturePlaceholder } from "../controllers/signature.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, createSignaturePlaceholder)

export default router