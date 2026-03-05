// The user model
const Trip = require("../models/Trip.model")
const Follow = require("../models/Follow.model")
const Memory = require("../models/Memory.model")
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
        const newTrip = await Trip.create({
            title: req.body.title,
            description: req.body.description,
            cities: req.body.cities,
            category: req.body.category,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            cost: req.body.cost,
            visibility: req.body.visibility,
            user: loggedUserId
        })
        res.status(201).json(newTrip)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.put(
    "/:tripId",
    verifyToken,
    loadResource(Trip, "tripId", "trip"),
    checkOwnership("user", "trip"),
    async (req, res, next) => {
        try {
            const trip = req.trip
            Object.assign(trip, req.body)
            await trip.save()
            res.status(200).json(trip)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
)

// Get
router.get(
    '/:userId/user', 
    verifyToken,
    async (req, res, next) => {
        try {
            const viewerId = req.payload._id
            const targetUserId = req.params.userId
            let visibilityFilter = ["Public"]
            if (viewerId === targetUserId) {
                visibilityFilter = ["Public", "Followers", "Private"];
            } else {
                // Check if viewer follows the target user
                const follow = await Follow.findOne({
                    follower: viewerId,
                    following: targetUserId,
                    status: "Accepted"
                });
                if (follow) {
                    visibilityFilter = ["Public", "Followers"];
                }
            }
            const trips = await Trip.find({
                user: targetUserId,
                visibility: { $in: visibilityFilter }
            })
            res.status(200).json(trips)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
);

// Get
router.get(
    "/:tripId",
    verifyToken,
    loadResource(Trip, "tripId", "trip"),
    checkOwnership("user", "trip"),
    async (req, res) => {
        res.status(200).json(req.trip)
    }
);

// Deletes a student
router.delete(
    "/:tripId",
    verifyToken,
    loadResource(Trip, "tripId", "trip"),
    checkOwnership("user", "trip"),
    async (req, res, next) => {
    try {
        const trip = req.trip;
        const memories = await Memory.find({
            trip: trip._id
        })
        const memoryIds = memories.map(m => m._id)
        await Comment.deleteMany({ memory: { $in: memoryIds } })
        await Reaction.deleteMany({ memory: { $in: memoryIds } })
        await Memory.deleteMany({ _id: { $in: memoryIds } })
        await trip.deleteOne();
        res.status(200).json(trip);
    } catch (error) {
        console.log('error');
        next(error);
    }
});

module.exports = router