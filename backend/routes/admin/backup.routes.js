const express = require("express");
const backup = require("../../backupService");
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.post("/backup", authenticateJWT(), backup.createBackup);
router.get("/backups", authenticateJWT(), backup.listBackups);
router.get("/backup/:filename", authenticateJWT(), backup.downloadBackup);

module.exports = router;