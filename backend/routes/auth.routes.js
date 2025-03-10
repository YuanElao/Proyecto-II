const express = require("express");
const authentication = require("../controllers/auth");

const router = express.Router();

router.post("/login", authentication.login);


module.exports = router;
