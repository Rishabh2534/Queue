import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
    userId: String,
    queue: [
        {
            id: Number,
            joinedAt: Date,
        },
    ],
});

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;

