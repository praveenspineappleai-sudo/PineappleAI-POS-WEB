const express = require("express");
const router = express.Router();
const verifyController = require("../Controllers/verifyController");

// Phone OTP
router.post("/send-phone-otp", verifyController.sendPhoneOtp);
router.post("/verify-phone-otp", verifyController.verifyPhoneOtp);

// Email OTP
router.post("/send-email-otp", verifyController.sendEmailOtp);
router.post("/verify-email-otp", verifyController.verifyEmailOtp);

// Access Key (latest)
router.post("/create-access-key", verifyController.createAccessKey);       // Creates and stores key
router.post("/send-access-key", verifyController.sendAccessKeyEmail); // Sends email using existing key

router.post("/verify-access-key", verifyController.verifyAccessKey);

module.exports = router;
