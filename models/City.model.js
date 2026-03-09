const { Schema, model, default: mongoose } = require("mongoose");

const citySchema = new Schema(
    {
        country: {
            type: String,
            required: [true, "Country is mandatory"],
        },
        city: {
            type: String,
            required: [true, "City is mandatory"]
        },
        latitude: Number,
        longitude: Number
    },
    {
        timestamps: true
    }
)

const City = model("City", citySchema)

module.exports = City