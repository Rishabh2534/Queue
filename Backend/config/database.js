import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://rishabhmishra2534:Mishra1234@sociouser.7lkuy1r.mongodb.net/Queue?retryWrites=true&w=majority&appName=sociouser", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit process on failure
    }
};

export default connectDB;
