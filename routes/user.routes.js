// The user model
const User = require("../models/User.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

router.patch("/", async (req, res, next) => {
    try {
        const allowedUpdates = ["firstName", "lastName", "profileImage"]
        const updates = {}
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        })
        const loggedUserId = req.payload._id
        const user = await User.findByIdAndUpdate(
            loggedUserId,
            {
                firstName: updates.firstName,
                lastName: updates.lastName,
                profileImage: updates.profileImage
            },
            { returnDocument: "after" }
        )
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Get
router.get('/', async (req, res, next) => {
  try {
        const loggedUserId = req.payload._id
        const user = await User.findById({
            user: loggedUserId
        })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Get
router.get('/:userId', async (req, res, next) => {
  try {
        const user = await User.findById({
            user: req.params.userId
        })
        .select("firstName lastName profileImage");
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Get
router.get('/', async (req, res, next) => {
  try {
        const query = {
            firstName: req.query.search,
            lastName: req.query.search,
        }
        const users = await User.find(query)
        .select("firstName lastName profileImage");
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = router