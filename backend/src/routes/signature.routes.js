import express from "express"
import {
    createSignaturePlaceholder,
    finalizeSignature,
    createPublicSignaturePlaceholder,
    finalizePublicSignature,
    getPublicSignature,
    getAllSignatures,
    deleteSignature
} from "../controllers/signature.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/:documentId", authMiddleware, getAllSignatures)
router.post("/", authMiddleware, createSignaturePlaceholder)
router.post("/sign", authMiddleware, finalizeSignature)
router.post("/public", authMiddleware, createPublicSignaturePlaceholder)
router.get("/public/:token", getPublicSignature)
router.post("/public/:token/finalize", finalizePublicSignature)
router.delete("/:id", authMiddleware, deleteSignature)

export default router