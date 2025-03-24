const express = require("express");
const profileAdmin = require("../../controllers/admin/profileAdmin")
const authenticateJWT = require('../../authmiddle');


const router = express.Router();

router.put("/profile/:cedula", profileAdmin.edit);

router.delete("/profile/:cedula", profileAdmin.delete);

module.exports = router;