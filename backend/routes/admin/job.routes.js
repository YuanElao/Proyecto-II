const express = require("express");
const job = require("../../controllers/admin/job")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/job/list", job.list)
router.get("/job/list/:id_departamento", job.listByDepartment)
router.post("/job/add", job.add)
router.put("/job/:id_departamento", job.edit)
router.delete("/job/:id_departamento", job.delete)

module.exports = router;