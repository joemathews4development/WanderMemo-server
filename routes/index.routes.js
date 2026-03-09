// ℹ️ The main router for the app.
const router = require("express").Router()

// ℹ️ Organize and connect all your route files here.
const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

const tripRouter = require("./trip.routes")
router.use("/trips", tripRouter)

const memoryRouter = require("./memory.routes")
router.use("/memories", memoryRouter)

const userRouter = require("./user.routes")
router.use("/users", userRouter)

const followRouter = require("./follow.routes")
router.use("/follows", followRouter)

const commentRouter = require("./comment.routes")
router.use("/comments", commentRouter)

const reactionRouter = require("./reaction.routes")
router.use("/reactions", reactionRouter)

const uploadRoutes = require("./upload.routes");
router.use("/upload", uploadRoutes);

module.exports = router;