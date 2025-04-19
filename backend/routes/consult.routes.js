const express = require("express");
const getW = require("../controllers/consult");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.get("/consult/workers", authenticateJWT(), getW.list);
router.get("/consult/worker", authenticateJWT(), getW.search);


module.exports = router;
