const express = require("express");
const report = require("../../controllers/admin/report");
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/report/:id_trabajador/anios",authenticateJWT('admin'), report.obtenerAnios);

router.get("/report/:id_trabajador/data",authenticateJWT('admin'), report.obtenerDatosReporte);

module.exports = router;