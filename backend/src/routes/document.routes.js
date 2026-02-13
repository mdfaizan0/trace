import express from "express"
import { upload } from "../middlewares/upload.middleware.js"
import { documentUpload, getAllDocuments } from "../controllers/document.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, upload, documentUpload)
router.get("/", authMiddleware, getAllDocuments)

export default router