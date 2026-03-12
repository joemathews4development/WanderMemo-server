// The user model
const { verifyToken } = require("../middlewares/auth.middlewares")
const loadResource = require("../middlewares/loadResource.middlewares")
const checkOwnership = require("../middlewares/ownership.middlewares")
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

router.patch(
    "/:followId", 
    verifyToken, 
    loadResource(Follow, "followId", "follow"), 
    checkOwnership("following", "follow"),
    async (req, res, next) => {
        try {
            const follow = req.follow
            Object.assign(follow, req.body)
            await follow.save()
            res.status(200).json(follow)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
)

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
router.get('/', verifyToken, async (req, res, next) => {
  try {
    console.log("over here")
        const loggedUserId = req.payload._id
        const query = {
            following: loggedUserId,
            status: req.query.status
        }
        console.log(loggedUserId, req.query.status)
        const followRequests = await Follow.find(query)
        .populate("follower")
        console.log("Follow requests:", followRequests)
        res.status(200).json(followRequests)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = router