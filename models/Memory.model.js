const { Schema, model, default: mongoose } = require("mongoose");

const memorySchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is mandatory"],
        },
        caption: String,
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City"
        },
        medias: [String],
        type: {
            type: String,
            enum: [
                "Memory", "Tip", "Family", "Review",
                "Food", "Stay", "Other"
            ]
        },
        date: Date,
        cost: {
            type: String,
            default: "0"
        },
        visibility: {
            type: String,
            enum: ["Public", "Private", "Followers"],
            default: "Public"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is mandatory"]
        },
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: [true, "Trip is mandatory"]
        }

    },
    {
        timestamps: true
    }
)

const Memory = model("Memory", memorySchema)

module.exports = Memory