import express from "express"
import { signUp, signIn, getMyProfile } from "../controllers/auth.controller.js"
import { authMiddleware} from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/signup", signUp)
router.post("/signin", signIn)
router.get("/me", authMiddleware, getMyProfile)

export default router