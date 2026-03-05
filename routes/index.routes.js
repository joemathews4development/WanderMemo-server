// ℹ️ The main router for the app.
const router = require("express").Router()

const { verifyToken, verifyPremiumUser } = require("../middlewares/auth.middlewares")

// ℹ️ Organize and connect all your route files here.
const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

module.exports = router;