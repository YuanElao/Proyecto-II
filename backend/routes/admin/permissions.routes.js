const express = require("express");
const { permissionRegister } = require("../../controllers/admin/permissions");
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.post("/permission", authenticateJWT('admin'), permissionRegister);

module.exports = router;
