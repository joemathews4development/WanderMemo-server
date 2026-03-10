// The user model
const { verifyToken } = require("../middlewares/auth.middlewares")
const Follow = require("../models/Follow.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

router.post("/request", verifyToken, async (req, res, next) => {
    try {
        const loggedInUser = req.payload._id
        const newFollow = await Follow.create({
            status: req.body.status,
            follower: loggedInUser,
            following: req.body.following
        })
        res.status(201).json(newFollow)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.patch("/:followId", async (req, res, next) => {
    try {
        const follow = await Follow.findByIdAndUpdate(
            req.params.followId,
            { status: req.body.status },
            { returnDocument: "after" }
        )
        res.status(200).json(follow)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Get
router.get('/followers/:userId', async (req, res, next) => {
  try {
        const followers = await Follow.find({
            following: req.params.userId
        })
        .populate("followers")
        res.status(200).json(followers)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Get
router.get('/following/:userId', async (req, res, next) => {
  try {
        const followings = await Follow.find({
            follower: req.params.userId
        })
        .populate("following")
        res.status(200).json(followings)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Get
router.get('/', async (req, res, next) => {
  try {
        const loggedUserId = req.payload._id
        const query = {
            followingId: loggedUserId,
            status: req.query.status
        }
        const followRequests = await Follow.find(query)
        .populate("follower")
        res.status(200).json(followRequests)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = router