import express from "express";
import {  getQueue, addToQueue, removeFromQueue ,getQR,Login,Signup, sendSMS} from "../controllers/queueController.js";

const router = express.Router();

router.get("/getqr/:userId", getQR);
//router.post("/generate-qr/:userId", generateQR);
router.get("/queue/:userId", getQueue);
router.post("/queue", addToQueue);
router.delete("/queue/:userId", removeFromQueue);
router.post("/Signup",Signup);
router.post("/Login",Login);
router.post("/send-sms",sendSMS);
export default router;
