// The user model
const { verifyToken } = require("../middlewares/auth.middlewares")
const loadResource = require("../middlewares/loadResource.middlewares")
const checkOwnership = require("../middlewares/ownership.middlewares")
const Comment = require("../models/Comment.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

router.post("/memories/:memoryId", verifyToken, async (req, res, next) => {
    try {
        const loggedUser = req.payload._id
        const memory =req.params.memoryId
        const newComment = await Comment.create({
            content: req.body.content,
            user: loggedUser,
            memory: memory
        })
        res.status(201).json(newComment)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.patch("/:commentId", async (req, res, next) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.reactionId,
            { content: req.body.content },
            { returnDocument: "after" }
        )
        res.status(200).json(comment)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Get
router.get('/:memoryId', async (req, res, next) => {
    try {
        const comments = await Comment.find({
            memory: req.params.memoryId
        })
        .populate("user")
        res.status(200).json(comments)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Deletes a comment
router.delete(
    '/:commentId',  
    verifyToken,
    loadResource(Comment, "commentId", "comment"),
    checkOwnership("user", "comment"),
    async (req, res) => {
    try {
        const comment = req.comment
        await comment.deleteOne()
        res.status(200).json(comment)
    } catch (error) {
        console.log('error');
        next(error);
    }
});

module.exports = router