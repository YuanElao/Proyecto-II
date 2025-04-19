const express = require("express");
const department = require("../../controllers/admin/department")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/department/list",authenticateJWT(), department.list);
router.post("/department/add",authenticateJWT('admin') , department.add);
router.put("/department/:id_departamento", authenticateJWT('admin'), department.edit);
router.delete("/department/:id_departamento", authenticateJWT('admin'), department.delete);

module.exports = router;