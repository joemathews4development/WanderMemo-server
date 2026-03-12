/**
 * @fileoverview User routes for the WanderMemo application.
 * Handles user profile management, retrieval, and search functionality.
 */

// The user model
const User = require("../models/User.model")

const Follow = require("../models/Follow.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

const { verifyToken, verifyPremiumUser } = require("../middlewares/auth.middlewares")

/**
 * @route PATCH /profile
 * @desc Update the authenticated user's profile information
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @param {Object} req.body - Fields to update: firstName, lastName, profileImage
 * @returns {Object} The updated user object
 * @throws {Error} If update fails
 */
router.patch(
    "/profile",
    verifyToken,
    async (req, res, next) => {
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
            const payload = {
                _id: user._id,
                email: user.email,
                // If we are having roles, we can add that here
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            res.status(200).json(payload)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
)

/**
 * @route GET /profile
 * @desc Get the authenticated user's profile
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @returns {Object} The user object including email
 * @throws {Error} If retrieval fails
 */
router.get('/profile', verifyToken, async (req, res, next) => {
    try {
        console.log(req.payload)
        const loggedUserId = req.payload._id
        const user = await User
            .findById(loggedUserId)
            .select("+email")
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

/**
 * @route GET /:userId
 * @desc Get a specific user's profile by ID
 * @access Private (requires authentication and premium user)
 * @middleware verifyToken, verifyPremiumUser
 * @param {string} req.params.userId - The ID of the user to retrieve
 * @returns {Object} The user object with firstName, lastName, profileImage
 * @throws {Error} If retrieval fails
 */
router.get(
    '/:userId',
    verifyToken,
    verifyPremiumUser,
    async (req, res, next) => {
        try {
            const user = await User
                .findById(req.params.userId)
                .select("firstName lastName profileImage");
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
);

/**
 * @route GET /
 * @desc Search users by firstName or lastName
 * @access Public
 * @param {string} req.query.search - The search term
 * @returns {Array} Array of user objects matching the search
 * @throws {Error} If search fails
 */
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const viewerId = req.payload._id
        const users = await User
            .find({
                $or: [
                    { firstName: { $regex: req.query.search, $options: "i" } },
                    { lastName: { $regex: req.query.search, $options: "i" } }
                ]
            })
            .select("firstName lastName profileImage")
        const userIds = users.map(u => u._id)
        // 2️⃣ Get current user's followings
        const follows = await Follow.find({
            follower: viewerId,
            following: { $in: userIds }
        }).select("following status")
        // map follow records for fast lookup
        const followMap = new Map()
        follows.forEach(f => {
            followMap.set(f.following.toString(), f.status)
        })
        // 3️⃣ attach status to users
        const result = users.map(user => ({
            ...user.toObject(),
            status: followMap.get(user._id.toString()) || "Not_requested"
        }))
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = router