const { Schema, model, default: mongoose } = require("mongoose");

const followSchema = new Schema(
    {
        status: {
            type: String,
            required: [true, "Status is mandatory"],
            enum: ["Pending", "Accepted", "Rejected", "Cancelled", "Blocked"]
        },
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

const Follow = model("Follow", followSchema)

module.exports = Follow