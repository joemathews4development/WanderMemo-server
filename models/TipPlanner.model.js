const { Schema, model, default: mongoose } = require("mongoose")

const tripPlannerSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        numberOfDays: {
            type: Number,
            required: true
        },
        cities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "City"
            }
        ],
        preferences: {
            type: String
            // optional free text like:
            // "budget travel", "romantic", "family friendly"
        },
        itinerary: [
            {
                day: Number,
                date: Date,
                city: String,

                activities: [
                    {
                        title: String,
                        description: String,
                        type: String, // Food / Sightseeing etc
                        location: String,
                        estimatedCost: String
                    }
                ]
            }
        ],
        generatedByAI: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
)

const TripPlanner = model("TripPlanner", tripPlannerSchema)

module.exports = TripPlanner