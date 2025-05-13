const express = require("express");
const profileAdmin = require("../../controllers/admin/profileAdmin")
const authenticateJWT = require('../../authmiddle');


const router = express.Router();

router.put("/profile/:cedula", authenticateJWT('admin'),profileAdmin.edit);
router.delete("/profile/:cedula", authenticateJWT('admin'),profileAdmin.delete);

router.post("/assist/create",authenticateJWT('admin'),profileAdmin.createA)
router.post("/fault/create",authenticateJWT('admin'),profileAdmin.createF)
router.post("/permission/create",authenticateJWT('admin'),profileAdmin.createP)

router.delete("/assist/delete", authenticateJWT('admin'),profileAdmin.deleteA);
router.delete("/fault/delete", authenticateJWT('admin'),profileAdmin.deleteF);
router.delete("/permission/delete", authenticateJWT('admin'),profileAdmin.deleteP);

router.put("/permission/update", authenticateJWT('admin'),profileAdmin.updateP);

router.get("/profile/reporte/:cedula", authenticateJWT('admin'),profileAdmin.generateReport)

module.exports = router;