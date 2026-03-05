/**
 * User Model
 * Defines the MongoDB schema and model for user documents in the WanderMemo application.
 * Handles user authentication, profile information, and role-based access control.
 * 
 * @module models/User
 */

const { Schema, model } = require("mongoose");

/**
 * User Schema Definition
 * Defines the structure and validation rules for user documents in MongoDB
 * 
 * @typedef {Object} User
 * @property {String} firstName - User's first name (required)
 * @property {String} lastName - User's last name (required)  
 * @property {String} email - User's email address (required, must be unique and lowercase)
 * @property {String} password - User's password hash (required)
 * @property {String} [profileImage] - Optional URL/path to user's profile image
 * @property {String} role - User's access level ('admin', 'user', or 'premium', default: 'premium')
 * @property {Date} createdAt - Auto-generated timestamp when user was created
 * @property {Date} updatedAt - Auto-generated timestamp of last modification
 */
const userSchema = new Schema(
  {
    firstName: {
        type: String,
        required: [true, "First name is mandatory"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last name is mandatory"],
        trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    profileImage: {
        type: String,
        default: null
    },
    role: {
      type: String,
      enum: ["admin", "user", "premium"],
      default: "premium"
    }
  },
  {
    // Automatically adds createdAt and updatedAt timestamp fields to track creation and modification times
    timestamps: true
  }
);

/**
 * User Model
 * Mongoose model for the User collection in MongoDB.
 * Use this model to perform CRUD operations on user documents.
 * 
 * @type {Model}
 * @example
 * // Create a new user
 * const user = await User.create({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   password: 'hashedPassword',
 *   role: 'user'
 * });
 * 
 * // Find user by email
 * const user = await User.findOne({ email: 'john@example.com' });
 * 
 * // Update user profile
 * await User.updateOne({ _id: userId }, { $set: { profileImage: 'url' } });
 */
const User = model("User", userSchema);

module.exports = User;
