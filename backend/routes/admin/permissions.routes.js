const express = require("express");
const permission = require("../../controllers/admin/permissions");
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.post("/permission/add",authenticateJWT('admin'), permission.register);

module.exports = router;
