// The user model
const { verifyToken } = require("../middlewares/auth.middlewares")
const Reaction = require("../models/Reaction.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

router.post("/memories/:memoryId", verifyToken, async (req, res, next) => {
    try {
        const loggedUser = req.payload._id
        const memory =req.params.memoryId
        const newReaction = await Reaction.findOneAndUpdate(
            { user: loggedUser, memory: memory },
            { emoji: req.body.emoji },
            { upsert: true, new: true }
        )
        res.status(201).json(newReaction)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.patch("/:reactionId", async (req, res, next) => {
    try {
        const reaction = await Reaction.findByIdAndUpdate(
            req.params.reactionId,
            { emoji: req.body.emoji },
            { returnDocument: "after" }
        )
        res.status(200).json(reaction)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Get
router.get('/:memoryId', async (req, res, next) => {
    try {
        const reactions = await Reaction.find({
            memory: req.params.memoryId
        })
        res.status(200).json(reactions)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Deletes a student
router.delete('/:reactionId', async (req, res) => {
    try {
        const reaction = await Reaction.findByIdAndDelete(req.params.reactionId);
        res.status(200).json(reaction);
    } catch (error) {
        console.log('error');
        next(error);
    }
});

module.exports = router