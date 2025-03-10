const express = require("express");
const { getP } = require("../controllers/profile");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.get("/profile/:cedula", authenticateJWT('user'), getP);


module.exports = router;