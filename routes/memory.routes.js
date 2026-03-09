/**
 * @fileoverview Memory routes for the WanderMemo application.
 * Handles memory creation, retrieval, updating, and deletion, including feed generation and cascading deletes.
 */

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

/**
 * @route POST /
 * @desc Create a new memory for the authenticated user
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @param {Object} req.body - Memory details: title, caption, city, medias, type, date, cost, visibility, trip
 * @returns {Object} The created memory object
 * @throws {Error} If creation fails
 */
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

/**
 * @route PUT /:memoryId
 * @desc Update an existing memory owned by the authenticated user
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Memory), checkOwnership
 * @param {string} req.params.memoryId - The ID of the memory to update
 * @param {Object} req.body - Fields to update in the memory
 * @returns {Object} The updated memory object
 * @throws {Error} If update fails or user doesn't own the memory
 */
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

/**
 * @route GET /
 * @desc Get the memory feed for the authenticated user (public memories and followers' memories)
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @returns {Array} Array of memory objects visible to the user
 * @throws {Error} If retrieval fails
 */
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

/**
 * @route GET /:tripId/trip
 * @desc Get all memories associated with a specific trip owned by the authenticated user
 * @access Private (requires authentication and trip ownership)
 * @middleware verifyToken, loadResource(Trip), checkOwnership
 * @param {string} req.params.tripId - The ID of the trip
 * @returns {Array} Array of memory objects for the trip
 * @throws {Error} If retrieval fails or user doesn't own the trip
 */
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
            const memoryIds = memories.map(m => m._id);
            const [reactions, comments] = await Promise.all([
                Reaction.find({ memory: { $in: memoryIds } }).lean(),
                Comment.find({ memory: { $in: memoryIds } }).lean()
            ]);
            const reactionCounts = await Reaction.aggregate([
                { $match: { memory: { $in: memoryIds } } },
                {
                    $group: {
                        _id: { memory: "$memory", emoji: "$emoji" },
                        count: { $sum: 1 }
                    }
                }
            ]);
            const commentCounts = await Comment.aggregate([
                { $match: { memory: { $in: memoryIds } } },
                {
                    $group: {
                        _id: "$memory",
                        count: { $sum: 1 }
                    }
                }
            ]);
            const reactionsByMemory = {}
            const commentsByMemory = {}
            reactionCounts.forEach(r => {
                const memoryId = r._id.memory
                const emoji = r._id.emoji
                if (!reactionsByMemory[memoryId]) reactionsByMemory[memoryId] = {}
                reactionsByMemory[memoryId][emoji] = r.count
            })
            commentCounts.forEach(c => {
                commentsByMemory[c._id] = c.count
            })
            const memoriesWithStats = memories.map(m => ({
                ...m,
                reactions: reactionsByMemory[m._id] || {},
                commentCount: commentsByMemory[m._id] || 0
            }))
            res.status(200).json(memoriesWithStats)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
);

/**
 * @route GET /:memoryId
 * @desc Get a specific memory owned by the authenticated user
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Memory), checkOwnership
 * @param {string} req.params.memoryId - The ID of the memory to retrieve
 * @returns {Object} The memory object
 * @throws {Error} If retrieval fails or user doesn't own the memory
 */
router.get(
    '/:memoryId',
    verifyToken,
    loadResource(Memory, "memoryId", "memory"),
    checkOwnership("user", "memory"),
    async (req, res, next) => {
        res.status(200).json(req.memory)
    }
);

/**
 * @route DELETE /:memoryId
 * @desc Delete a memory and all associated comments and reactions
 * @access Private (requires authentication and ownership)
 * @middleware verifyToken, loadResource(Memory), checkOwnership
 * @param {string} req.params.memoryId - The ID of the memory to delete
 * @returns {Object} The deleted memory object
 * @throws {Error} If deletion fails or user doesn't own the memory
 */
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