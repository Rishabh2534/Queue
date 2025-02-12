import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js"; // Import database connection
import queueRoutes from "./routes/queueRoutes.js";

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Create HTTP Server and WebSocket
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

// WebSocket Handling
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinQueue", (userId) => {
        socket.join(userId);
    });
    
    socket.on("updateQueue", (userId) => {
        console.log(`Emitting queueUpdated for userId: ${userId}`);  
        io.to(userId).emit("queueUpdated"); // Send only to the correct user
    });
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Middleware to pass `io` to controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Use Routes
app.use("/", queueRoutes);

// Start Server
server.listen(3000, () => console.log("✅ Server running on port 3000"));
