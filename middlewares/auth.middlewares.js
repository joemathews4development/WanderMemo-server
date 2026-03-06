/**
 * Authentication and authorization middleware utilities
 * Handles JWT token verification and role-based access control
 */
const jwt = require("jsonwebtoken")

/**
 * Middleware to verify JWT token from request headers
 * Extracts the token from the Authorization header (Bearer schema)
 * and validates it using the TOKEN_SECRET environment variable
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} Calls next() if token is valid, sends 401 error response if invalid
 * 
 * @example
 * // Token format in header: "Bearer <token>"
 * app.use(verifyToken)
 */
function verifyToken(req, res, next) {
    try {
        // Extract token from Authorization header (format: "Bearer <token>")
        const token = req.headers.authorization.split(" ")[1]
        // Verify token signature and decode payload
        const payload = jwt.verify(token, process.env.TOKEN_SECRET)

        // Attach decoded payload to request object for use in subsequent middleware/routes
        req.payload = payload
        next()
    } catch (error) {
        // Handle invalid or missing token
        res.status(401).json({ errorMessage: "There is no valid token with this request!" })
    }
}

/**
 * Middleware to verify user has premium role
 * Must be used after verifyToken middleware to access req.payload
 * 
 * @param {Object} req - Express request object (must have req.payload from verifyToken)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} Calls next() if user is premium, sends 401 error response otherwise
 * 
 * @example
 * app.get("/premium-route", verifyToken, verifyPremiumUser, controller)
 */
function verifyPremiumUser(req, res, next) {  
    if (req.payload.role === "premium") {
        next()
    } else {
        res.status(401).json({ errorMessage: "This is not a premium user. The user does not have permission to this route" })
    }
}

function verifyPermission(req, res, next) {  
    if (req.payload.role === "premium") {
        next()
    } else {
        res.status(401).json({ errorMessage: "This is not a premium user. The user does not have permission to this route" })
    }
}

module.exports = {
    verifyToken,
    verifyPremiumUser
}