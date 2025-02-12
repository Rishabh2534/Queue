import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, default: () => crypto.randomUUID() },
    username: String,
    email: String,
    password: String,
    qr:String,
    timeToServe:String,
    location:String
});

const User = mongoose.model("User", userSchema);
export default User;
