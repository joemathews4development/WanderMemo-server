/**
 * @fileoverview Trip routes for the WanderMemo application.
 * Handles trip creation, retrieval, updating, and deletion, including visibility controls and cascading deletes.
 */

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

/**
 * @route POST /
 * @desc Create a new trip for the authenticated user
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @param {Object} req.body - Trip details: title, description, cities, category, startDate, endDate, cost, visibility
 * @returns {Object} The created trip object
 * @throws {Error} If creation fails
 */
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

/**
 * @route PUT /:tripId
 * @desc Update an existing trip owned by the authenticated user
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Trip), checkOwnership
 * @param {string} req.params.tripId - The ID of the trip to update
 * @param {Object} req.body - Fields to update in the trip
 * @returns {Object} The updated trip object
 * @throws {Error} If update fails or user doesn't own the trip
 */
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

/**
 * @route GET /:userId/user
 * @desc Get trips for a specific user, filtered by visibility based on relationship
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @param {string} req.params.userId - The ID of the user whose trips to retrieve
 * @returns {Array} Array of trip objects visible to the authenticated user
 * @throws {Error} If retrieval fails
 */
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

/**
 * @route GET /:tripId
 * @desc Get a specific trip owned by the authenticated user
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Trip), checkOwnership
 * @param {string} req.params.tripId - The ID of the trip to retrieve
 * @returns {Object} The trip object
 * @throws {Error} If retrieval fails or user doesn't own the trip
 */
router.get(
    "/:tripId",
    verifyToken,
    loadResource(Trip, "tripId", "trip"),
    checkOwnership("user", "trip"),
    async (req, res) => {
        res.status(200).json(req.trip)
    }
);

/**
 * @route DELETE /:tripId
 * @desc Delete a trip and all associated memories, comments, and reactions
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Trip), checkOwnership
 * @param {string} req.params.tripId - The ID of the trip to delete
 * @returns {Object} The deleted trip object
 * @throws {Error} If deletion fails or user doesn't own the trip
 */
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