const express = require("express");
const job = require("../../controllers/admin/job")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/job/list",authenticateJWT(), job.list)
router.get("/job/list/:id_departamento",authenticateJWT(), job.listByDepartment)
router.post("/job/add",authenticateJWT('admin'), job.add)
router.put("/job/:id_departamento",authenticateJWT('admin'), job.edit)
router.delete("/job/:id_departamento",authenticateJWT('admin'), job.delete)

module.exports = router;