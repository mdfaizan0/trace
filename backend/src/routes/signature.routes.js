import express from "express"
import {
    createSignaturePlaceholder,
    finalizeSignature,
    createPublicSignaturePlaceholder,
    finalizePublicSignature,
    getPublicSignature,
    getAllSignatures,
    deleteSignature,
    getAllPublicSignatures
} from "../controllers/signature.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/:documentId", authMiddleware, getAllSignatures)
router.get("/public/all/:documentId", authMiddleware, getAllPublicSignatures)
router.post("/", authMiddleware, createSignaturePlaceholder)
router.post("/sign", authMiddleware, finalizeSignature)

router.get("/public/:token", getPublicSignature)
router.post("/public", authMiddleware, createPublicSignaturePlaceholder)
router.post("/public/:token/finalize", finalizePublicSignature)

router.delete("/:id", authMiddleware, deleteSignature)

export default router