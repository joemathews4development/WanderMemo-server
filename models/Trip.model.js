const { Schema, model, default: mongoose } = require("mongoose");

const tripSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is mandatory"],
        },
        description: String,
        cities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "City"
            }
        ],
        category: {
            type: String,
            enum: [
                "Adventure", "Relaxation", "Family", "Solo",
                "Business", "Backpacking", "Luxury", "Other"
            ]
        },
        startDate: Date,
        endDate: Date,
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
        }
    },
    {
        timestamps: true
    }
)

const Trip = model("Trip", tripSchema)

module.exports = Trip