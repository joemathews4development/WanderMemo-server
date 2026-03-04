// The user model
const User = require("../models/User.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

// POST "/api/auth/signup" => Creating a user document.
router.post("/signup", async (req, res, next) => {
    console.log(req.body)
    const {firstName, lastName, email, password, profileImage, role} = req.body
    if(!firstName || !lastName || !email || !password) {
        res.status(400).json({ errorMessage: "firstName, lastName, email and password are mandatory" })
        return
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    if (!passwordRegex.test(password)) {
        res.status(400).json({errorMessage: "Password must follow this pattern (min 8 characters, max 20 characters, include lowercase, include uppercase and include number)"})
        return
    }
    try {
        const foundUser = await User.findOne( { email: email } )
        if (foundUser) {
            res.status(400).json({errorMessage: `There exists a user with the email: "${email}". Please try with a different email`})
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

// POST "/api/auth/login" => Validating user credentials and sending the token
router.post("/login", async (req, res, next) => {
    console.log(req.body)
    const {email, password} = req.body
    if(!email || !password) {
        res.status(400).json({errorMessage: "email and password are required"})
        return
    }

    try {
        const foundUser = await User.findOne( { email: email } )
        if (!foundUser) {
            res.status(400).json({errorMessage: `There is no user with the email: "${email}". Please sign up first`})
            return
        }
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            res.status(400).json({errorMessage: `The entered password does not match the email. Please try with the correct password`})
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
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: process.env.TOKEN_EXPIRES_IN
        })
        res.status(200).json({ authToken: authToken, payload: payload })
    } catch (error) {
        next(error)
    }
})

module.exports = router