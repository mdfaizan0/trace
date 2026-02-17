import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { getDocumentAuditLogs } from "../controllers/audit.controller.js"

const router = Router()

router.get("/:documentId", authMiddleware, getDocumentAuditLogs)

export default router