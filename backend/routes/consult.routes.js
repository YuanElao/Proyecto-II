const express = require("express");
const getW = require("../controllers/consult");
const authenticateJWT = require('../authmiddle');

const router = express.Router();

router.get("/workers", getW.list);
router.get("/worker", getW.search);

module.exports = router;
