const express = require("express");
const report = require("../../controllers/admin/report");
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/report/:id_trabajador/anios",authenticateJWT('admin'), report.obtenerAnios);

router.get("/report/:id_trabajador/data",authenticateJWT('admin'), report.obtenerDatosReporte);

router.get("/report/:id_trabajador/meses/:anio",authenticateJWT('admin'), report.obtenerMesesDisponibles);

// Nueva ruta para obtener años generales
router.get("/report/anios-generales", authenticateJWT('admin'), report.obtenerAniosGenerales);

// Nueva ruta para eliminar por año
router.delete("/report/eliminar/:anio", authenticateJWT('admin'), report.eliminarPorAnio);


module.exports = router;