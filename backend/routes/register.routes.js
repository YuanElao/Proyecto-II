const express = require("express");
const register = require("../controllers/register");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.post("/register", authenticateJWT("user"), register.worker);

module.exports = router;
