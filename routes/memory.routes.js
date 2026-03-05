// The user model
const Memory = require("../models/Memory.model")
const Trip = require("../models/Trip.model")
const Follow = require("../models/Follow.model")
const Comment = require("../models/Comment.model")
const Reaction = require("../models/Reaction.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

const { verifyToken } = require("../middlewares/auth.middlewares")
const loadResource = require("../middlewares/loadResource.middlewares")
const checkOwnership = require("../middlewares/ownership.middlewares")

router.post("/", verifyToken, async (req, res, next) => {
    try {
        const loggedUserId = req.payload._id
        const newMemory = await Memory.create({
            title: req.body.title,
            caption: req.body.caption,
            city: req.body.city,
            medias: req.body.medias,
            type: req.body.type,
            date: req.body.date,
            cost: req.body.cost,
            visibility: req.body.visibility,
            user: loggedUserId,
            trip: req.body.trip
        })
        res.status(201).json(newMemory)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.put(
    "/:memoryId",
    verifyToken,
    loadResource(Memory, "memoryId", "memory"),
    checkOwnership("user", "memory"),
    async (req, res, next) => {
        try {
            const memory = req.memory
            Object.assign(memory, req.body)
            await memory.save()
            res.status(200).json(memory)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
)

// Get
router.get(
    '/',
    verifyToken,
    async (req, res, next) => {
        try {
            const viewerId = req.payload._id
            const follows = await Follow
                .find({
                    follower: viewerId,
                    status: "Accepted"
                })
                .select("following")
            const followingIds = follows.map(f => f.following)
            const memories = await Memory.find({
                user: { $ne: viewerId },
                $or: [
                    // users I follow
                    {
                        user: { $in: followingIds },
                        visibility: { $in: ["Public", "Followers"] }
                    },
                    // users I do NOT follow
                    {
                        user: { $nin: followingIds },
                        visibility: "Public"
                    }
                ]
            })
            res.status(200).json(memories)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
);

// Get
router.get(
    '/:tripId/trip',
    verifyToken,
    loadResource(Trip, "tripId", "trip"),
    checkOwnership("user", "trip"),
    async (req, res, next) => {
        try {
            const memories = await Memory.find({
                trip: req.params.tripId
            })
            res.status(200).json(memories)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
);

// Get
router.get(
    '/:memoryId',
    verifyToken,
    loadResource(Memory, "memoryId", "memory"),
    checkOwnership("user", "memory"),
    async (req, res, next) => {
        res.status(200).json(req.memory)
    }
);

// Deletes a student
router.delete(
    '/:memoryId',
    verifyToken,
    loadResource(Memory, "memoryId", "memory"),
    checkOwnership("user", "memory"),
    async (req, res) => {
        try {
            const memory = req.memory
            await Comment.deleteMany({ memory: memory._id })
            await Reaction.deleteMany({ memory: memory._id })
            await memory.deleteOne();
            res.status(200).json(memory);
        } catch (error) {
            console.log('error');
            next(error);
        }
    });

module.exports = router