const express = require("express");
const department = require("../../controllers/admin/department")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/department/list", department.list);
router.post("/department/add", department.add);
router.put("/department/:id_departamento", department.edit);
router.delete("/department/:id_departamento", department.delete);

module.exports = router;