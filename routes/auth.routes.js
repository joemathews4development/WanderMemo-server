/**
 * @fileoverview Authentication routes for the WanderMemo application.
 * Handles user registration, login, and account management operations.
 */

// The user model
const User = require("../models/User.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

const { verifyToken } = require("../middlewares/auth.middlewares")

/**
 * @route POST /signup
 * @desc Register a new user account
 * @access Public
 * @param {Object} req.body - User registration details
 * @param {string} req.body.firstName - User's first name (required)
 * @param {string} req.body.lastName - User's last name (required)
 * @param {string} req.body.email - User's email address (required, unique)
 * @param {string} req.body.password - User's password (required, must match regex)
 * @param {string} [req.body.profileImage] - User's profile image URL
 * @param {string} [req.body.role] - User's role
 * @returns {Object} The created user object
 * @throws {Error} If validation fails or user already exists
 */
router.post("/signup", async (req, res, next) => {
    console.log(req.body)
    const { firstName, lastName, email, password, profileImage, role } = req.body
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ errorMessage: "firstName, lastName, email and password are mandatory" })
        return
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    if (!passwordRegex.test(password)) {
        res.status(400).json({ errorMessage: "Password must follow this pattern (min 8 characters, max 20 characters, include lowercase, include uppercase and include number)" })
        return
    }
    try {
        const foundUser = await User.findOne({ email: email })
        if (foundUser) {
            res.status(400).json({ errorMessage: `There exists a user with the email: "${email}". Please try with a different email` })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            profileImage: profileImage,
            role: role
        })
        res.status(201).send(user)
    } catch (error) {
        next(error)
    }
})

/**
 * @route POST /login
 * @desc Authenticate user and return JWT token
 * @access Public
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User's email address (required)
 * @param {string} req.body.password - User's password (required)
 * @returns {Object} Object containing authToken and user payload
 * @throws {Error} If credentials are invalid or user not found
 */
router.post("/login", async (req, res, next) => {

    const { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({ errorMessage: "email and password are required" })
        return
    }
    try {
        const foundUser = await User.findOne({ email: email }).select("+password +email")
        if (!foundUser) {
            res.status(400).json({ errorMessage: `There is no user with the email: "${email}". Please sign up first` })
            return
        }
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            res.status(400).json({ errorMessage: `The entered password does not match the email. Please try with the correct password` })
            return
        }
        const payload = {
            _id: foundUser._id,
            email: foundUser.email,
            // If we are having roles, we can add that here
            role: foundUser.role,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName
        }
        console.log(payload)
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: process.env.TOKEN_EXPIRES_IN
        })
        res.status(200).json({ authToken: authToken, payload: payload })
    } catch (error) {
        next(error)
    }
})


/**
 * @route PATCH /changeEmail
 * @desc Change the authenticated user's email address
 * @access Private (requires authentication)
 * @middleware verifyToken
 * @param {Object} req.body - Email change details
 * @param {string} req.body.newEmail - The new email address
 * @returns {Object} Success message
 * @throws {Error} If update fails
 */
router.patch("/changeEmail", verifyToken, async (req, res, next) => {
    try {
        const loggedUserId = req.payload._id
        const { newEmail } = req.body
        if (!newEmail) {
            res.status(400).json({ errorMessage: "email is mandatory" })
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(newEmail)) {
            res.status(400).json({ errorMessage: "invalid email format" })
            return
        }
        const foundUser = await User.findOne({ _id: loggedUserId }).select("+email")
        if (!foundUser) {
            res.status(400).json({ errorMessage: `There is no such user". Please sign up first` })
            return
        }
        if (newEmail === foundUser.email) {
            res.status(400).json({ errorMessage: `The entered new email is same as the old one. Do you want to try a new one?` })
            return
        }
        await User.findByIdAndUpdate(
            loggedUserId,
            { email: newEmail }
        )
        res.status(200).json({ message: "new email set successfully." })
    } catch (error) {
        console.log(error)
        next(error)
    }
})

/**
 * @route PATCH /changePassword
 * @desc Change the authenticated user's password
 * @access Private (requires authentication)
 * @middleware verifyToken (note: middleware not applied in code)
 * @param {Object} req.body - Password change details
 * @param {string} req.body.oldPassword - The current password (not validated in code)
 * @param {string} req.body.newPassword - The new password
 * @returns {Object} Success message
 * @throws {Error} If update fails
 */
router.patch("/changePassword", verifyToken, async (req, res, next) => {
    try {
        const loggedUserId = req.payload._id
        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) {
            res.status(400).json({ errorMessage: "oldPassword and newPassword are mandatory" })
            return
        }
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
        if (!passwordRegex.test(newPassword)) {
            res.status(400).json({ errorMessage: "Password must follow this pattern (min 8 characters, max 20 characters, include lowercase, include uppercase and include number)" })
            return
        }
        const foundUser = await User.findOne({ _id: loggedUserId }).select("+password")
        if (!foundUser) {
            res.status(400).json({ errorMessage: `There is no such user". Please sign up first` })
            return
        }
        const isPasswordCorrect = await bcrypt.compare(oldPassword, foundUser.password)
        if (!isPasswordCorrect) {
            res.status(400).json({ errorMessage: `The entered current password does not match the one in DB. Please try with the correct password` })
            return
        }
        const isPasswordSame = await bcrypt.compare(newPassword, foundUser.password)
        if (isPasswordSame) {
            res.status(400).json({ errorMessage: `The new password is same as old one. Please try with a different password` })
            return
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await User.findByIdAndUpdate(
            loggedUserId,
            { password: hashedPassword }
        )
        res.status(200).json({ message: "new password set successfully." })
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// GET "/api/auth/verify" => Validates the token on new users accessing the client
router.get("/verify", verifyToken, (req, res) => {
    res.status(200).json({ payload: req.payload })
})

module.exports = router