// Delete Account Routes

const express = require("express");
const router = express.Router();
const { deleteAccount } = require("../Controllers/deleteAccountController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Delete account (POST)
router.post("/delete", authMiddleware, deleteAccount);

module.exports = router;
