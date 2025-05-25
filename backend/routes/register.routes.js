const express = require("express");
const worker = require("../controllers/register");
const authenticateJWT = require("../authmiddle");

const router = express.Router();

router.post("/register", authenticateJWT(), worker.register);

module.exports = router;
