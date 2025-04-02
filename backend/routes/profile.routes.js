const express = require("express");
const getP = require("../controllers/profile");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.get("/profile/:cedula", authenticateJWT(), getP.profile);


module.exports = router;