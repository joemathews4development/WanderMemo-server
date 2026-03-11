const { Schema, model, default: mongoose } = require("mongoose");

const reactionSchema = new Schema(
    {
        emoji: {
            type: String,
            required: [true, "Reaction is mandatory"],
            enum: ["👍", "❤️", "😂", "😮", "😢", "😡", "🔥"]
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        memory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Memory"
        }
    },
    {
        timestamps: true
    }
)
reactionSchema.index(
  { user: 1, memory: 1 },
  { unique: true }
)

const Reaction = model("Reaction", reactionSchema)

module.exports = Reaction