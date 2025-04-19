const express = require("express");
const profileAdmin = require("../../controllers/admin/profileAdmin")
const authenticateJWT = require('../../authmiddle');


const router = express.Router();

router.put("/profile/:cedula", authenticateJWT('admin'),profileAdmin.edit);
router.delete("/profile/:cedula", authenticateJWT('admin'),profileAdmin.delete);

router.get("/profile/reporte/:cedula", authenticateJWT('admin'),profileAdmin.generateReport)

module.exports = router;