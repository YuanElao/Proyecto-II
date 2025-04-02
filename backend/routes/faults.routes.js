const express = require("express");
const faults = require("../controllers/faults");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.post("/faltas/register", authenticateJWT('admin'),faults.register);

module.exports = router;
