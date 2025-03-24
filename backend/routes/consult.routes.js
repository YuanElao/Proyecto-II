const express = require("express");
const getW = require("../controllers/consult");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.get("/consult/workers", getW.list);
router.get("/consult/worker", getW.search);


module.exports = router;
