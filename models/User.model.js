const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
        type: String,
        required: [true, "First name is mandatory"]
    },
    lastName: {
        type: String,
        required: [true, "First name is mandatory"]
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
    profileImage: String,
    role: {
      type: String,
      enum: ["admin", "user", "premium"],
      default: "premium"
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
