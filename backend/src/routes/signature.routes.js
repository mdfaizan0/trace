import express from "express"
import { createSignaturePlaceholder, finalizeSignature } from "../controllers/signature.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, createSignaturePlaceholder)
router.post("/sign", authMiddleware, finalizeSignature)

export default router