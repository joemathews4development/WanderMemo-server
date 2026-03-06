const { Schema, model, default: mongoose } = require("mongoose");

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "Content is mandatory"],
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

const Comment = model("Comment", commentSchema)

module.exports = Comment