const express = require("express");
const qrAssistRe = require("../controllers/qrAssist");

const router = express.Router();

router.post("/qrAssist-re", qrAssistRe.register);

router.get("/assist-notify", qrAssistRe.sseHandler);

module.exports = router;
