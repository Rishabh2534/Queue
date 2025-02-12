import Queue from "../model/QueueModel.js";
import User from "../model/UserModel.js";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Twilio from "twilio";
import axios from "axios";
export const getQR= async(req,res)=>{
    try {
        const userId = req.params.userId;
        const user = await User.findOne({userId });
        const qrCode= user.qr;
        res.json({ qrCode });
    } catch (error) {
        res.status(500).json({ error: "Error generating QR Code" });
    }
}

// Get Queue for a User
export const getQueue = async (req, res) => {
    const { userId } = req.params;
    const queueData = await Queue.findOne({ userId });
    res.json(queueData ? queueData.queue : []);
};

// Add a Person to Queue
export const addToQueue = async (req, res) => {

    //to find travel time##############################################################timet to serve and location in userSchema
    const { userId,clientLocation} = req.body;
    const user=await User.findOne({userId});
    const destination= user.location;
    let travelTime=0;
    try{
      const clientLocationString = `${clientLocation.latitude},${clientLocation.longitude}`;
      const destinationString = destination 
      ? `${destination.latitude},${destination.longitude}` 
      : clientLocationString;;

      // Define the Google Maps API key
      const googleMapsApiKey = '77395bc0-703e-4260-864c-03c79c8667dd';

      // Make the API request to get the travel time
      const response = await axios.get(
          `https://graphhopper.com/api/1/route?point=${clientLocationString}&point=${destinationString}&vehicle=car&key=${googleMapsApiKey}`
      );
      
      // Extract the travel time from the response (convert milliseconds to seconds)
       travelTime = response.data.paths[0].time / 1000;// Travel time in seconds
       console.log("done setting time",travelTime);
    }catch(e){
      
      console.log(e);
    }
    //add new client to queue
    let queueData = await Queue.findOne({ userId });
    if (!queueData) {
        queueData = new Queue({ userId, queue: [] });
    }
    const newUser = { id: Date.now(), joinedAt: new Date() };
    queueData.queue.push(newUser);
    const updatedQueue = await queueData.save();
    
    // Find the newly added queue entry (last one added based on reference)
    const addedUser = updatedQueue.queue.find(entry => entry.joinedAt.getTime() === newUser.joinedAt.getTime());
    
    req.io.to(userId).emit("queueUpdated");//informing the room for new client added 
    res.json({ message: `You joined ${userId}'s queue!`,
               queue:    queueData.queue,
               _id:addedUser?._id,                 //sending info about newly added client to frontend
               timeToReach:travelTime,
               timeToServe:user.timeToServe});
};

// Remove the First Person from Queue
export const removeFromQueue = async (req, res) => {
    const { userId } = req.params;
    
    let queueData = await Queue.findOne({ userId });

    if (queueData && queueData.queue.length > 0) {
       
        queueData.queue.shift();  // Removes the first person
        await queueData.save();
        req.io.to(userId).emit("deleteFromQ");
        req.io.to(userId).emit("queueUpdated");
        res.json({ message: "Next person served!", queue: queueData.queue });
    } else {
        res.json({ message: "Queue is empty!" });
    }
};

export const Signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (userId is generated automatically)
        const newUser = new User({ username:username, email:email, password: hashedPassword });
        await newUser.save();

        // Generate QR Code
        const qrCode = await QRCode.toDataURL(`http://2409:4063:4211:2e31:5d60:3589:38da:ad66/join/${newUser.userId}`);

        // Update user with QR Code
        newUser.qr = qrCode;
        await newUser.save();

        // Generate Token
        const token = generateToken(newUser.userId);

        res.status(201).json({ success: true, message: "User registered successfully", userId: newUser.userId, qrCode, token });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

  
  export const Login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid email" });
      }
  
      // Verify password
      const isMatch =  bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid  password" });
      }
  
      // Generate JWT token
      const token = generateToken(user.userId);
  
      res.status(200).json({ success: true, message: "Login successful", userId: user.userId, token });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  const generateToken=(userId)=>{
    return jwt.sign({ userId }, "tyejty", { expiresIn: "1h" }); // Token expires in 1 hour
};

export const sendSMS = async(req, res) => {
  const { message, clientPhoneNumber } = req.body;
  const apiKey = ""; // Replace with your actual API key
  const sender = "TXTLCL"; // Your sender ID (approved by Textlocal)
  const numbers = `91${clientPhoneNumber}`; // Replace with the recipient's mobile number
  const messages = message;

  const url = `https://api.textlocal.in/send/?apikey=${apiKey}&numbers=${numbers}&sender=${sender}&message=${encodeURIComponent(messages)}&test=0`;

  try {
    const response = await axios.get(url);
    console.log("SMS Sent Successfully:", response.data);
  } catch (error) {
    console.error("Error sending SMS:", error.response ? error.response.data : error.message);
  }
    
  
  /*const apiKey = "aPvMTLYAQ6utjc2fzkiZxmrbIXhWgN38FGny0dos1OEBHq9CJVeSD2tJ39CoxudRvibnUmsQzZqFOylX"; // Replace with your actual API key

    try {
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          sender_id: "TXTIND", // Must be a valid sender ID from Fast2SMS
          message: "Hello! This is a test message from Fast2SMS.",
          language: "english",
          route: "v3",  // Use "v3" or "q" for transactional messages
          numbers: "9026697519" // Enter recipient's number
        },
        {
          headers: {
            authorization: apiKey, // Replace with your API Key
            "Content-Type": "application/json"
          }
        }
      );
      console.log("SMS Sent Successfully:", response.data);
    } catch (error) {
      console.error("Error sending SMS:", error.response?.data || error.message);
    }
  
    const { message, clientPhoneNumber } = req.body;
    
    const client = Twilio('ACe6eb4f7f72a72982f7bb7437beade997', '8c09da3f4ba7277e27ee23ee3ed2ad69');
    
    client.messages.create({
      body: message,
      from: '+18777804236', // Your Twilio number
      to: clientPhoneNumber,
    })
    .then(message => res.json({ success: true, message: 'Notification sent!' }))
    .catch(error => res.status(500).json({ success: false, error: error.message }));*/
  };