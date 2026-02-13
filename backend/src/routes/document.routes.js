import express from "express"
import { upload } from "../middlewares/upload.middleware.js"
import { documentUpload, getAllDocuments, getDocumentById, deleteDocument, downloadOriginalDocument, downloadSignedDocument } from "../controllers/document.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, upload, documentUpload)
router.get("/", authMiddleware, getAllDocuments)
router.get("/:id", authMiddleware, getDocumentById)
router.get("/:id/download/original", authMiddleware, downloadOriginalDocument)
router.get("/:id/download/signed", authMiddleware, downloadSignedDocument)
router.delete("/:id", authMiddleware, deleteDocument)

export default router