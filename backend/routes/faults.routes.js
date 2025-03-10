const express = require("express");
const faultsRegister = require("../controllers/faults");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.post("/faltas", authenticateJWT('admin'),faultsRegister.register);

module.exports = router;
