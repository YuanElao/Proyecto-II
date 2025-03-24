const express = require("express");
const departmen = require("../../controllers/admin/department")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/department/list", departmen.list);
router.post("/department/add", departmen.add);
router.put("/department/:id_departamento", departmen.edit);
router.delete("/department/:id_departamento", departmen.delete);

module.exports = router;